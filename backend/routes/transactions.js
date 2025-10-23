const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getUserTransactions, 
  getTransactionDetail,
  getAllTransactions,
  getAllCashiers
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// Kasir routes
router.post('/', authMiddleware, createTransaction);
router.get('/my-transactions', authMiddleware, getUserTransactions);
router.get('/:id', authMiddleware, getTransactionDetail);

// Admin routes
router.get('/admin/all', authMiddleware, admin, getAllTransactions);
router.get('/admin/cashiers', authMiddleware, admin, getAllCashiers);

module.exports = router;