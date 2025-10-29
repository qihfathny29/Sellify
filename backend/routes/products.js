const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Categories route (must be before /:id)
router.get('/categories', protect, productController.getCategories);

// Public routes
router.get('/', protect, productController.getAllProducts);
router.get('/:id', protect, productController.getProductById);

// Admin only routes
router.post('/', protect, adminOnly, upload.single('image'), productController.createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);
router.post('/bulk-delete', protect, adminOnly, productController.bulkDeleteProducts);

module.exports = router;