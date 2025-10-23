const sql = require('mssql');
const dbConfig = require('../config/db');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { period = 'today' } = req.query; // today, week, month, year
    
    let dateFilter = '';
    
    // Set date filter based on period
    if (period === 'today') {
      dateFilter = `AND CAST(t.created_at AS DATE) = CAST(GETDATE() AS DATE)`;
    } else if (period === 'week') {
      dateFilter = `AND t.created_at >= DATEADD(day, -7, GETDATE())`;
    } else if (period === 'month') {
      dateFilter = `AND t.created_at >= DATEADD(day, -30, GETDATE())`;
    } else if (period === 'year') {
      dateFilter = `AND YEAR(t.created_at) = YEAR(GETDATE())`;
    }
    
    let pool = await sql.connect(dbConfig);
    
    // Get total revenue and transaction count
    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(t.id) as total_transactions,
        ISNULL(SUM(t.total_amount), 0) as total_revenue,
        ISNULL(AVG(t.total_amount), 0) as avg_transaction
      FROM transactions t
      WHERE t.status = 'completed'
      ${dateFilter}
    `);
    
    // Get total items sold
    const itemsResult = await pool.request().query(`
      SELECT 
        ISNULL(SUM(ti.quantity), 0) as total_items_sold
      FROM transaction_items ti
      INNER JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.status = 'completed'
      ${dateFilter}
    `);
    
    const stats = statsResult.recordset[0];
    const items = itemsResult.recordset[0];
    
    // Don't close the pool - let it be reused
    
    res.json({
      success: true,
      data: {
        total_revenue: parseFloat(stats.total_revenue) || 0,
        total_transactions: parseInt(stats.total_transactions) || 0,
        items_sold: parseInt(items.total_items_sold) || 0,
        avg_transaction: parseFloat(stats.avg_transaction) || 0
      }
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

// Get revenue trend (last 7 days)
const getRevenueTrend = async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    
    const result = await pool.request().query(`
      SELECT 
        CAST(t.created_at AS DATE) as date,
        DATENAME(WEEKDAY, t.created_at) as day_name,
        ISNULL(SUM(t.total_amount), 0) as revenue
      FROM transactions t
      WHERE t.status = 'completed'
        AND t.created_at >= DATEADD(day, -7, GETDATE())
      GROUP BY CAST(t.created_at AS DATE), DATENAME(WEEKDAY, t.created_at)
      ORDER BY CAST(t.created_at AS DATE)
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
    
  } catch (error) {
    console.error('Get revenue trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue trend'
    });
  }
};

// Get sales by category
const getSalesByCategory = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let pool = await sql.connect(dbConfig);
    let dateFilter = '';
    
    if (period === 'today') {
      dateFilter = `AND CAST(t.created_at AS DATE) = CAST(GETDATE() AS DATE)`;
    } else if (period === 'week') {
      dateFilter = `AND t.created_at >= DATEADD(day, -7, GETDATE())`;
    } else if (period === 'month') {
      dateFilter = `AND t.created_at >= DATEADD(day, -30, GETDATE())`;
    }
    
    // JOIN with categories table
    const result = await pool.request().query(`
      SELECT 
        ISNULL(c.name, 'Uncategorized') as category,
        COUNT(ti.id) as item_count,
        ISNULL(SUM(ti.total_price), 0) as total_sales
      FROM transaction_items ti
      INNER JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN products p ON ti.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE t.status = 'completed'
      ${dateFilter}
      GROUP BY c.name
      ORDER BY total_sales DESC
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
    
  } catch (error) {
    console.error('Get sales by category error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales by category',
      error: error.message
    });
  }
};

// Get top products
const getTopProducts = async (req, res) => {
  try {
    const { period = 'today', limit = 5 } = req.query;
    
    let pool = await sql.connect(dbConfig);
    let dateFilter = '';
    
    if (period === 'today') {
      dateFilter = `AND CAST(t.created_at AS DATE) = CAST(GETDATE() AS DATE)`;
    } else if (period === 'week') {
      dateFilter = `AND t.created_at >= DATEADD(day, -7, GETDATE())`;
    } else if (period === 'month') {
      dateFilter = `AND t.created_at >= DATEADD(day, -30, GETDATE())`;
    }
    
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          p.id,
          p.name,
          p.image_url,
          SUM(ti.quantity) as total_sold,
          ISNULL(SUM(ti.total_price), 0) as total_revenue
        FROM transaction_items ti
        INNER JOIN transactions t ON ti.transaction_id = t.id
        INNER JOIN products p ON ti.product_id = p.id
        WHERE t.status = 'completed'
        ${dateFilter}
        GROUP BY p.id, p.name, p.image_url
        ORDER BY total_sold DESC
      `);
    
    res.json({
      success: true,
      data: result.recordset
    });
    
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top products'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueTrend,
  getSalesByCategory,
  getTopProducts
};