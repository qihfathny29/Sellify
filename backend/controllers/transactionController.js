const sql = require('mssql');
const db = require('../config/db');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const pool = await sql.connect(db);
    
    const query = `
      SELECT 
        id,
        transaction_code,
        total_amount,
        payment_method,
        payment_amount,
        change_amount,
        status,
        created_at,
        subtotal,
        tax
      FROM transactions
      ORDER BY created_at DESC
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { 
      items, 
      payment_method, 
      amount_paid, 
      payment_amount, 
      customer_name, 
      subtotal: clientSubtotal, 
      tax: clientTax, 
      total: clientTotal, 
      change_amount: clientChange 
    } = req.body;

    console.log('🔍 Transaction request body:', req.body);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }

    const pool = await sql.connect(db);

    // Use client calculations or calculate server-side
    let subtotal = clientSubtotal || 0;
    let tax = clientTax || 0;
    let total = clientTotal || 0;
    let item_count = 0;

    // If client didn't send calculations, calculate server-side
    if (!clientSubtotal) {
      for (const item of items) {
        subtotal += item.price * item.quantity;
        item_count += item.quantity;
      }
      tax = subtotal * 0.1; // 10% tax
      total = subtotal + tax;
    }

    // Use amount_paid or payment_amount
    const paidAmount = amount_paid || payment_amount || 0;
    const change = clientChange || (paidAmount - total);

    if (change < 0 && payment_method === 'cash') {
      return res.status(400).json({
        success: false,
        message: 'Payment amount is insufficient'
      });
    }

    // Generate transaction code
    const transaction_code = 'TRX' + Date.now();

    // Insert transaction
    const transactionQuery = `
      INSERT INTO transactions 
      (transaction_code, user_id, subtotal, tax, total_amount, payment_method, payment_amount, change_amount, status, created_at)
      OUTPUT INSERTED.id
      VALUES (@transaction_code, @user_id, @subtotal, @tax, @total_amount, @payment_method, @payment_amount, @change_amount, @status, GETDATE())
    `;

    const transactionRequest = pool.request();
    transactionRequest.input('transaction_code', sql.NVarChar, transaction_code);
    // Get user_id from auth middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    transactionRequest.input('user_id', sql.Int, userId);
    transactionRequest.input('subtotal', sql.Decimal(10, 2), subtotal);
    transactionRequest.input('tax', sql.Decimal(10, 2), tax);
    transactionRequest.input('total_amount', sql.Decimal(10, 2), total);
    transactionRequest.input('payment_method', sql.NVarChar, payment_method);
    transactionRequest.input('payment_amount', sql.Decimal(10, 2), paidAmount);
    transactionRequest.input('change_amount', sql.Decimal(10, 2), change);
    transactionRequest.input('status', sql.NVarChar, 'completed');

    const transactionResult = await transactionRequest.query(transactionQuery);
    const transaction_id = transactionResult.recordset[0].id;

    // Insert transaction items and update stock
    for (const item of items) {
      // Insert item
      const itemQuery = `
        INSERT INTO transaction_items 
        (transaction_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (@transaction_id, @product_id, @product_name, @quantity, @unit_price, @total_price)
      `;

      const itemRequest = pool.request();
      itemRequest.input('transaction_id', sql.Int, transaction_id);
      // Handle both id and product_id fields
      const productId = item.product_id || item.id;
      itemRequest.input('product_id', sql.Int, productId);
      itemRequest.input('product_name', sql.NVarChar, item.name);
      itemRequest.input('quantity', sql.Int, item.quantity);
      itemRequest.input('unit_price', sql.Decimal(10, 2), item.price);
      itemRequest.input('total_price', sql.Decimal(10, 2), item.price * item.quantity);

      await itemRequest.query(itemQuery);

      // Update stock
      const stockQuery = `
        UPDATE products 
        SET stock = stock - @quantity 
        WHERE id = @product_id
      `;

      const stockRequest = pool.request();
      stockRequest.input('quantity', sql.Int, item.quantity);
      stockRequest.input('product_id', sql.Int, productId);

      await stockRequest.query(stockQuery);
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        id: transaction_id,
        transaction_id,
        transaction_code,
        total,
        change,
        subtotal,
        tax,
        payment_method,
        payment_amount: paidAmount,
        change_amount: change
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

// Get transaction by ID with items
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Fetching transaction:', id);

    const pool = await sql.connect(db);

    // Get transaction detail
    const transactionQuery = `
      SELECT 
        id,
        transaction_code,
        total_amount,
        payment_method,
        payment_amount,
        change_amount,
        status,
        created_at,
        subtotal,
        tax
      FROM transactions
      WHERE id = @id
    `;

    const transactionRequest = pool.request();
    transactionRequest.input('id', sql.Int, id);
    const transactionResult = await transactionRequest.query(transactionQuery);

    if (transactionResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactionResult.recordset[0];
    console.log('✅ Transaction found:', transaction.id);

    // Get transaction items
    const itemsQuery = `
      SELECT 
        ti.id,
        ti.product_id,
        ti.product_name,
        ti.quantity,
        ti.unit_price as price,
        ti.total_price as subtotal,
        p.name as current_product_name,
        c.name as category_name
      FROM transaction_items ti
      LEFT JOIN products p ON ti.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ti.transaction_id = @transaction_id
    `;

    const itemsRequest = pool.request();
    itemsRequest.input('transaction_id', sql.Int, id);
    const itemsResult = await itemsRequest.query(itemsQuery);

    console.log('✅ Found items:', itemsResult.recordset.length);

    const items = itemsResult.recordset.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.current_product_name || item.product_name || 'Unknown Product',
      category_name: item.category_name || 'Uncategorized',
      quantity: item.quantity || 0,
      price: parseFloat(item.price) || 0,
      subtotal: parseFloat(item.subtotal) || (parseFloat(item.price) * item.quantity) || 0
    }));

    res.json({
      success: true,
      data: {
        ...transaction,
        items: items
      }
    });

  } catch (error) {
    console.error('❌ Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    console.log('🔍 Getting transactions for user:', userId);
    
    // Pastikan userId ada
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const pool = await sql.connect(db);
    
    // Get transactions with item count - HANYA untuk user yang login
    const query = `
      SELECT 
        t.id,
        t.transaction_code,
        t.user_id,
        t.total_amount,
        t.payment_method,
        t.payment_amount,
        t.change_amount,
        t.status,
        t.created_at,
        t.subtotal,
        t.tax,
        COUNT(ti.id) as item_count
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.user_id = @userId
      GROUP BY t.id, t.transaction_code, t.user_id, t.total_amount, t.payment_method, 
               t.payment_amount, t.change_amount, t.status, t.created_at, t.subtotal, t.tax
      ORDER BY t.created_at DESC
    `;

    const request = pool.request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(query);

    console.log('🔍 Found transactions for user', userId, ':', result.recordset.length);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user transactions',
      error: error.message
    });
  }
};

exports.getTransactionDetail = async (req, res) => {
  return exports.getTransactionById(req, res);
};

exports.getAllCashiers = async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const query = `SELECT user_id as id, name, username FROM users WHERE role = 'cashier'`;
    const result = await pool.request().query(query);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Get cashiers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cashiers'
    });
  }
};