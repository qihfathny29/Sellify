const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getRevenueTrend,
  getSalesByCategory,
  getTopProducts
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// All routes require admin authentication
router.use(protect, admin);

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Revenue trend (last 7 days)
router.get('/revenue-trend', getRevenueTrend);

// Sales by category
router.get('/sales-by-category', getSalesByCategory);

// Top products
router.get('/top-products', getTopProducts);

module.exports = router;
