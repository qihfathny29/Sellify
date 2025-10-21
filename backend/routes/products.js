const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
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
router.get('/', authMiddleware, roleMiddleware(['admin', 'kasir']), getAllProducts);
router.get('/categories/list', authMiddleware, roleMiddleware(['admin', 'kasir']), getCategories);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'kasir']), getProductById);
router.post('/', authMiddleware, roleMiddleware(['admin']), upload.single('image'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteProduct);

module.exports = router;