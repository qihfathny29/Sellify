const sql = require('mssql');
const dbConfig = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

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

// Get all products with filters
exports.getAllProducts = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category_id: req.query.category_id,
      stock_status: req.query.stock_status,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await Product.findAll(filters);

    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

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
                p.image_url,
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
        p.image_url,
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
                    p.image_url,
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

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { name, category_id, price, stock, unit, description } = req.body;

    // Validation
    if (!name || !category_id || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and stock are required'
      });
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    // Connect to database
    const pool = await sql.connect(dbConfig);

    // Generate barcode SEBELUM insert (pakai timestamp untuk unique)
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 999);
    const tempBarcode = `8999${timestamp.slice(-6)}${String(randomNum).padStart(3, '0')}`;

    // Insert product dengan barcode temporary
    const insertQuery = `
      INSERT INTO products 
      (name, category_id, price, stock, unit, description, image_url, barcode, created_at)
      OUTPUT INSERTED.id
      VALUES (@name, @category_id, @price, @stock, @unit, @description, @image_url, @barcode, GETDATE())
    `;

    const request = pool.request();
    request.input('name', sql.NVarChar, name);
    request.input('category_id', sql.Int, parseInt(category_id));
    request.input('price', sql.Decimal(10, 2), parseFloat(price));
    request.input('stock', sql.Int, parseInt(stock));
    request.input('unit', sql.NVarChar, unit || 'pcs');
    request.input('description', sql.NVarChar, description || '');
    request.input('image_url', sql.NVarChar, imagePath);
    request.input('barcode', sql.NVarChar, tempBarcode);

    const result = await request.query(insertQuery);
    const productId = result.recordset[0].id;

    // Generate barcode final dengan product ID
    const finalBarcode = `8999${String(productId).padStart(9, '0')}`;

    // Update barcode dengan yang final
    const updateQuery = `
      UPDATE products 
      SET barcode = @barcode 
      WHERE id = @id
    `;

    const updateRequest = pool.request();
    updateRequest.input('barcode', sql.NVarChar, finalBarcode);
    updateRequest.input('id', sql.Int, productId);
    await updateRequest.query(updateQuery);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: productId,
        name,
        category_id,
        price,
        stock,
        unit,
        description,
        barcode: finalBarcode,
        image_url: imagePath
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, price, stock, unit, description } = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle image upload
    let imagePath = existingProduct.image_url;
    if (req.file) {
      // Delete old image if exists
      if (existingProduct.image_url) {
        const oldImagePath = path.join(__dirname, '..', existingProduct.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    const productData = {
      name: name || existingProduct.name,
      category_id: category_id || existingProduct.category_id,
      price: price || existingProduct.price,
      stock: stock !== undefined ? stock : existingProduct.stock,
      unit: unit || existingProduct.unit,
      description: description !== undefined ? description : existingProduct.description,
      image_url: imagePath
    };

    await Product.update(id, productData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { id, ...productData }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete image if exists
    if (product.image) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.delete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Bulk delete products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    // Delete images for all products
    for (const id of ids) {
      const product = await Product.findById(id);
      if (product && product.image) {
        const imagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    const deletedCount = await Product.bulkDelete(ids);

    res.json({
      success: true,
      message: `${deletedCount} products deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete products',
      error: error.message
    });
  }
};

// GET /api/products/categories - Get all categories
exports.getCategories = async (req, res) => {
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