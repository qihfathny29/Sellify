const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Users route working!' });
});

// Get all users (admin only)
router.get('/', admin, getUsers);

// Get user by id
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Delete user (admin only)
router.delete('/:id', admin, deleteUser);

module.exports = router;