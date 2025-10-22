const sql = require('mssql');
const dbConfig = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/products - Get all products with pagination
const getProducts = async (req, res) => {
    console.log('🎯 getProducts called!');  // ← ADD THIS LINE
    try {
        const { page = 1, limit = 10, search = '', category = '' } = req.query;
        const offset = (page - 1) * limit;

        let pool = await sql.connect(dbConfig);

        // Build WHERE clause for search and filter
        let whereClause = 'WHERE p.is_active = 1';
        let searchParams = [];

        if (search) {
            whereClause += ' AND (p.name LIKE @search OR p.barcode LIKE @search)';
            searchParams.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
        }

        if (category) {
            whereClause += ' AND p.category_id = @category';
            searchParams.push({ name: 'category', type: sql.Int, value: parseInt(category) });
        }

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereClause}
        `;

        let countRequest = pool.request();
        searchParams.forEach(param => {
            countRequest.input(param.name, param.type, param.value);
        });
        const countResult = await countRequest.query(countQuery);
        const total = countResult.recordset[0].total;

        // Get products with pagination
        let productsQuery = `
            SELECT 
                p.id,
                p.name,
                p.barcode,
                p.category_id,
                c.name as category_name,
                p.price,
                p.cost,
                p.stock,
                p.min_stock,
                p.image_url as image,    -- ← ADD THIS ALIAS!
                p.description,
                p.is_active,
                p.created_at,
                p.updated_at,
                CASE 
                    WHEN p.stock <= p.min_stock THEN 'low'
                    WHEN p.stock = 0 THEN 'out'
                    ELSE 'normal'
                END as stock_status
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereClause}
            ORDER BY p.created_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        let productsRequest = pool.request();
        searchParams.forEach(param => {
            productsRequest.input(param.name, param.type, param.value);
        });
        productsRequest.input('offset', sql.Int, offset);
        productsRequest.input('limit', sql.Int, parseInt(limit));

        const productsResult = await productsRequest.query(productsQuery);

        await pool.close();

        res.json({
            success: true,
            data: productsResult.recordset,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch products' 
        });
    }
};

const getAllProducts = async (req, res) => {
  console.log('🎯 getAllProducts called!');  // ← ADD THIS LINE
  try {
    let pool = await sql.connect(dbConfig);
    const query = `
      SELECT 
        p.id,
        p.name,
        p.barcode,
        p.price,
        p.cost,
        p.stock,
        p.min_stock,
        p.image_url as image,
        p.description,
        p.is_active as status,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.name
    `;
    
    const result = await pool.request().query(query);
    
    console.log('🔥 Backend products:', result.recordset);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// GET /api/products/:id - Get single product
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    p.id,
                    p.name,
                    p.barcode,
                    p.price,
                    p.cost,
                    p.stock,
                    p.min_stock,
                    p.image_url as image,    -- ← ALIAS image_url as image
                    p.description,
                    p.is_active as status,
                    c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = @id
            `);

        await pool.close();

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

// POST /api/products - Create new product
const createProduct = async (req, res) => {
  try {
    const { name, category_id, price, cost, stock, min_stock, description } = req.body;
    
    // AUTO-GENERATE BARCODE - menggunakan timestamp + random
    const generateBarcode = () => {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return timestamp + random; // Format: 1729612345123456
    };

    let pool = await sql.connect(dbConfig);

    // Generate unique barcode
    let barcode = generateBarcode();
    
    // Check if barcode already exists, regenerate if needed
    let existingCheck = await pool.request()
      .input('barcode', sql.NVarChar, barcode)
      .query('SELECT id FROM products WHERE barcode = @barcode');
    
    while (existingCheck.recordset.length > 0) {
      barcode = generateBarcode();
      existingCheck = await pool.request()
        .input('barcode', sql.NVarChar, barcode)
        .query('SELECT id FROM products WHERE barcode = @barcode');
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    // Insert product with auto-generated barcode
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('barcode', sql.NVarChar, barcode)
      .input('category_id', sql.Int, parseInt(category_id))
      .input('price', sql.Decimal(10, 2), parseFloat(price))
      .input('cost', sql.Decimal(10, 2), parseFloat(cost) || 0)
      .input('stock', sql.Int, parseInt(stock) || 0)
      .input('min_stock', sql.Int, parseInt(min_stock) || 5)
      .input('image_url', sql.NVarChar, image_url)
      .input('description', sql.Text, description || '')
      .query(`
        INSERT INTO products (name, barcode, category_id, price, cost, stock, min_stock, image_url, description, is_active) 
        OUTPUT INSERTED.id
        VALUES (@name, @barcode, @category_id, @price, @cost, @stock, @min_stock, @image_url, @description, 1)
      `);

    const newProductId = result.recordset[0].id;

    // Get the created product with category info
    const productResult = await pool.request()
      .input('id', sql.Int, newProductId)
      .query(`
        SELECT 
          p.id, p.name, p.barcode, p.category_id, p.price, p.cost, p.stock, p.min_stock, 
          p.image_url, p.description, p.is_active, p.created_at, p.updated_at,
          c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = @id
      `);

    await pool.close();

    res.status(201).json({
      success: true,
      message: `Product created successfully with auto-generated barcode: ${barcode}`,
      data: productResult.recordset[0]
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

// PUT /api/products/:id - Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            barcode,
            category_id,
            price,
            cost = 0,
            stock = 0,
            min_stock = 5,
            description = '',
            is_active = 1
        } = req.body;

        console.log('🔍 Update Product Request Body:', req.body);
        console.log('🔍 Uploaded File:', req.file);

        // Handle image upload
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/products/${req.file.filename}`;
            console.log('✅ New image uploaded:', image_url);
        } else {
            // Keep existing image if no new image uploaded
            let pool = await sql.connect(dbConfig);
            const existingProduct = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT image_url FROM products WHERE id = @id');
            
            if (existingProduct.recordset.length > 0) {
                image_url = existingProduct.recordset[0].image_url;
            }
            await pool.close();
        }

        let pool = await sql.connect(dbConfig);

        // Check if product exists
        const existingProduct = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id FROM products WHERE id = @id');

        if (existingProduct.recordset.length === 0) {
            await pool.close();
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Check barcode uniqueness (if changed)
        if (barcode) {
            const barcodeCheck = await pool.request()
                .input('barcode', sql.NVarChar, barcode)
                .input('id', sql.Int, id)
                .query('SELECT id FROM products WHERE barcode = @barcode AND id != @id');

            if (barcodeCheck.recordset.length > 0) {
                await pool.close();
                return res.status(409).json({
                    success: false,
                    error: 'Barcode already exists'
                });
            }
        }

        // Update product
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('barcode', sql.NVarChar, barcode || null)
            .input('category_id', sql.Int, category_id)
            .input('price', sql.Decimal(15, 2), price)
            .input('cost', sql.Decimal(15, 2), cost)
            .input('stock', sql.Int, stock)
            .input('min_stock', sql.Int, min_stock)
            .input('image_url', sql.NVarChar, image_url)
            .input('description', sql.NVarChar, description)
            .input('is_active', sql.Bit, is_active)
            .query(`
                UPDATE products 
                SET 
                    name = @name,
                    barcode = @barcode,
                    category_id = @category_id,
                    price = @price,
                    cost = @cost,
                    stock = @stock,
                    min_stock = @min_stock,
                    image_url = @image_url,
                    description = @description,
                    is_active = @is_active,
                    updated_at = GETDATE()
                WHERE id = @id
            `);

        // Get updated product
        const updatedProduct = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    p.id,
                    p.name,
                    p.barcode,
                    p.category_id,
                    c.name as category_name,
                    p.price,
                    p.cost,
                    p.stock,
                    p.min_stock,
                    p.image_url,
                    p.description,
                    p.is_active,
                    p.created_at,
                    p.updated_at
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = @id
            `);

        await pool.close();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct.recordset[0]
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
};

// DELETE /api/products/:id - Soft delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        let pool = await sql.connect(dbConfig);

        // Check if product exists
        const existingProduct = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id FROM products WHERE id = @id AND is_active = 1');

        if (existingProduct.recordset.length === 0) {
            await pool.close();
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Soft delete (set is_active = 0)
        await pool.request()
            .input('id', sql.Int, id)
            .query(`
                UPDATE products 
                SET is_active = 0, updated_at = GETDATE()
                WHERE id = @id
            `);

        await pool.close();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
};

// GET /api/categories - Get all categories
const getCategories = async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`
                SELECT id, name, description, is_active, created_at
                FROM categories
                WHERE is_active = 1
                ORDER BY name ASC
            `);

        await pool.close();

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
};

module.exports = {
    getProducts,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    upload // ← Export upload middleware
};