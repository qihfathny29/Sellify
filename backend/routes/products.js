const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  upload // ← Import upload middleware
} = require('../controllers/productController');

// POST /api/products - Create new product (with file upload)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  upload.single('image'), // ← Add multer middleware
  createProduct
);

// GET /api/products - Get all products (admin and kasir can read)
router.get('/', authMiddleware, roleMiddleware(['admin', 'kasir']), getProducts);

// GET /api/products/:id - Get single product (admin and kasir can read)
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'kasir']), getProductById);

// PUT /api/products/:id - Update product (admin only, with file upload)
router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  upload.single('image'), // ← Add multer middleware
  updateProduct
);

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteProduct);

// GET /api/categories - Get all categories (admin and kasir can read)
router.get('/categories/all', authMiddleware, roleMiddleware(['admin', 'kasir']), getCategories);

module.exports = router;