const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  getUsers,
  getUserById,
  createUser,
  updateUser, 
  deleteUser,
  getProfile,
  updateProfile,
  updateProfilePhoto 
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Profile routes (untuk semua user yang login)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/profile/photo', authMiddleware, upload.single('photo'), updateProfilePhoto); // Tambah ini

// All other routes require authentication
router.use(authMiddleware);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Users route working!' });
});

// Get all users (admin only)
router.get('/', admin, getUsers);

// Create new user (admin only)
router.post('/', admin, createUser);

// Get user by id
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Delete user (admin only)
router.delete('/:id', admin, deleteUser);

module.exports = router;