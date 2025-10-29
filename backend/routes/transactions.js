const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getUserTransactions, 
  getTransactionDetail,
  getAllTransactions,
  getAllCashiers
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// Kasir routes
router.post('/', protect, createTransaction);
router.get('/my-transactions', protect, getUserTransactions);
router.get('/:id', protect, getTransactionDetail);

// Admin routes
router.get('/admin/all', protect, admin, getAllTransactions);
router.get('/admin/cashiers', protect, admin, getAllCashiers);

module.exports = router;