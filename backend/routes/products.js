const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin, kasir } = require('../middleware/roleMiddleware');
const { 
  getProducts, 
  getAllProducts,
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getCategories,
  upload 
} = require('../controllers/productController');

// Routes
router.get('/', authMiddleware, kasir, getAllProducts);
router.get('/categories/list', authMiddleware, kasir, getCategories);
router.get('/:id', authMiddleware, kasir, getProductById);
router.post('/', authMiddleware, admin, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, admin, upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, admin, deleteProduct);

module.exports = router;