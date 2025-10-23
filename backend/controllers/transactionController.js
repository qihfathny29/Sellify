const sql = require('mssql');
const dbConfig = require('../config/db');

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      tax,
      total,
      payment_method,
      amount_paid,
      change_amount
    } = req.body;
    
    console.log('Creating transaction:', { items, total, payment_method });
    console.log('User from middleware:', req.user); // Debug log
    
    if (!req.user || (!req.user.id && !req.user.userId)) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const user_id = req.user.id || req.user.userId; // Support both formats
    const transaction_code = `TRX-${Date.now()}`;
    
    console.log('Using user_id:', user_id); // Debug log
    
    let pool = await sql.connect(dbConfig);
    
    // Insert to transactions table
    const transactionResult = await pool.request()
      .input('transaction_code', sql.NVarChar, transaction_code)
      .input('user_id', sql.Int, user_id)
      .input('total', sql.Decimal, total)
      .input('payment_method', sql.NVarChar, payment_method)
      .input('amount_paid', sql.Decimal, amount_paid)
      .input('change_amount', sql.Decimal, change_amount)
      .query(`
        INSERT INTO transactions (transaction_code, user_id, total_amount, payment_method, payment_amount, change_amount, status, created_at)
        OUTPUT INSERTED.id
        VALUES (@transaction_code, @user_id, @total, @payment_method, @amount_paid, @change_amount, 'completed', GETDATE())
      `);
    
    const transaction_id = transactionResult.recordset[0].id;
    
    // Insert transaction items
    for (const item of items) {
      await pool.request()
        .input('transaction_id', sql.Int, transaction_id)
        .input('product_id', sql.Int, item.id)
        .input('product_name', sql.NVarChar, item.name)
        .input('quantity', sql.Int, item.quantity)
        .input('unit_price', sql.Decimal, item.price)
        .input('total_price', sql.Decimal, item.quantity * item.price)
        .query(`
          INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, total_price, created_at)
          VALUES (@transaction_id, @product_id, @product_name, @quantity, @unit_price, @total_price, GETDATE())
        `);
      
      // Update product stock
      await pool.request()
        .input('quantity', sql.Int, item.quantity)
        .input('product_id', sql.Int, item.id)
        .query(`
          UPDATE products SET stock = stock - @quantity WHERE id = @product_id
        `);
    }
    
    await pool.close();
    
    res.json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        id: transaction_id,
        transaction_code,
        total
      }
    });
    
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

// Get user transactions
const getUserTransactions = async (req, res) => {
  try {
    const user_id = req.user.id || req.user.userId; // Support both formats
    
    console.log('Getting transactions for user:', user_id); // Debug log
    console.log('Full user object:', req.user); // Debug log
    
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT 
          t.id,
          t.transaction_code,
          t.total_amount,
          t.payment_method,
          t.payment_amount,
          t.change_amount,
          t.status,
          t.created_at,
          ISNULL(SUM(ti.quantity), 0) as item_count
        FROM transactions t
        LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
        WHERE t.user_id = @user_id
        GROUP BY t.id, t.transaction_code, t.total_amount, t.payment_method, t.payment_amount, t.change_amount, t.status, t.created_at
        ORDER BY t.created_at DESC
      `);
    
    console.log('Found transactions:', result.recordset.length); // Debug log
    
    await pool.close();
    
    res.json({
      success: true,
      data: result.recordset
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

// Get transaction detail
const getTransactionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    let pool = await sql.connect(dbConfig);
    
    // Get transaction
    const transactionResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT * FROM transactions WHERE id = @id
      `);
    
    if (transactionResult.recordset.length === 0) {
      await pool.close();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Get transaction items
    const itemsResult = await pool.request()
      .input('transaction_id', sql.Int, id)
      .query(`
        SELECT 
          ti.*,
          p.name as current_product_name,
          p.image_url
        FROM transaction_items ti
        LEFT JOIN products p ON ti.product_id = p.id
        WHERE ti.transaction_id = @transaction_id
        ORDER BY ti.id
      `);
    
    await pool.close();
    
    const transaction = transactionResult.recordset[0];
    transaction.items = itemsResult.recordset;
    
    res.json({
      success: true,
      data: transaction
    });
    
  } catch (error) {
    console.error('Get transaction detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction detail'
    });
  }
};

// Get ALL transactions (for Admin) - TAMBAHKAN INI!
const getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, cashier_id, status, search } = req.query;
    
    let pool = await sql.connect(dbConfig);
    let query = `
      SELECT 
        t.id,
        t.transaction_code,
        t.total_amount,
        t.payment_method,
        t.payment_amount,
        t.change_amount,
        t.status,
        t.created_at,
        u.username,
        u.full_name as cashier_name,
        ISNULL(SUM(ti.quantity), 0) as item_count
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id_user
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    // Filter by date range
    if (startDate && endDate) {
      query += ` AND CAST(t.created_at AS DATE) BETWEEN @startDate AND @endDate`;
      request.input('startDate', sql.Date, startDate);
      request.input('endDate', sql.Date, endDate);
    }
    
    // Filter by cashier
    if (cashier_id && cashier_id !== 'all') {
      query += ` AND t.user_id = @cashier_id`;
      request.input('cashier_id', sql.Int, cashier_id);
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query += ` AND t.status = @status`;
      request.input('status', sql.NVarChar, status);
    }
    
    // Search by transaction code or cashier name
    if (search) {
      query += ` AND (t.transaction_code LIKE @search OR u.full_name LIKE @search OR u.username LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }
    
    query += ` GROUP BY t.id, t.transaction_code, t.total_amount, t.payment_method, t.payment_amount, t.change_amount, t.status, t.created_at, u.username, u.full_name`;
    query += ` ORDER BY t.created_at DESC`;
    
    const result = await request.query(query);
    await pool.close();
    
    res.json({
      success: true,
      data: result.recordset
    });
    
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
};

// Get all cashiers (for filter) - TAMBAHKAN INI JUGA!
const getAllCashiers = async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT DISTINCT 
          u.id_user,
          u.username,
          u.full_name
        FROM users u
        INNER JOIN transactions t ON u.id_user = t.user_id
        WHERE u.is_active = 1
        ORDER BY u.full_name
      `);
    
    await pool.close();
    
    res.json({
      success: true,
      data: result.recordset
    });
    
  } catch (error) {
    console.error('Get cashiers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cashiers'
    });
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionDetail,
  getAllTransactions,     // Export baru
  getAllCashiers          // Export baru
};