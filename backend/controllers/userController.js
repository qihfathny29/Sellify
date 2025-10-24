const sql = require('mssql');
const dbConfig = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query('SELECT id_user, username, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC');
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id_user, username, full_name, role, is_active, created_at FROM users WHERE id_user = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT id_user, username, full_name, role, is_active, created_at, profile_photo FROM users WHERE id_user = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { full_name, username, current_password, new_password } = req.body;
    
    let pool = await sql.connect(dbConfig);
    
    // Get current user data
    const userResult = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT * FROM users WHERE id_user = @id');
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = userResult.recordset[0];
    
    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          message: 'Password saat ini harus diisi'
        });
      }
      
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Password saat ini salah'
        });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(new_password, salt);
      
      await pool.request()
        .input('full_name', sql.VarChar, full_name)
        .input('username', sql.VarChar, username)
        .input('password_hash', sql.VarChar, password_hash)
        .input('id', sql.Int, userId)
        .query('UPDATE users SET full_name = @full_name, username = @username, password_hash = @password_hash WHERE id_user = @id');
    } else {
      // Update without password change
      await pool.request()
        .input('full_name', sql.VarChar, full_name)
        .input('username', sql.VarChar, username)
        .input('id', sql.Int, userId)
        .query('UPDATE users SET full_name = @full_name, username = @username WHERE id_user = @id');
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const { full_name, username, password, role } = req.body;
    
    // Validate required fields
    if (!full_name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    let pool = await sql.connect(dbConfig);
    
    // Check if username already exists
    const existingUser = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT id_user FROM users WHERE username = @username');
    
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Insert new user
    const result = await pool.request()
      .input('full_name', sql.VarChar, full_name)
      .input('username', sql.VarChar, username)
      .input('password_hash', sql.VarChar, password_hash)
      .input('role', sql.VarChar, role)
      .query(`
        INSERT INTO users (username, password_hash, full_name, role, is_active)
        VALUES (@username, @password_hash, @full_name, @role, 1);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.recordset[0].id,
        username,
        full_name,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, username, role, is_active } = req.body;
    
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input('full_name', sql.VarChar, full_name)
      .input('username', sql.VarChar, username)
      .input('role', sql.VarChar, role)
      .input('is_active', sql.Bit, is_active)
      .input('id', sql.Int, id)
      .query('UPDATE users SET full_name = @full_name, username = @username, role = @role, is_active = @is_active WHERE id_user = @id');
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM users WHERE id_user = @id');
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Update profile photo
const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let pool = await sql.connect(dbConfig);

    // Get old profile photo
    const userResult = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT profile_photo FROM users WHERE id_user = @id');

    const oldPhoto = userResult.recordset[0]?.profile_photo;

    // Delete old photo if exists
    if (oldPhoto) {
      const oldPhotoPath = path.join(__dirname, '..', oldPhoto.replace(/^\//, ''));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Save new photo path
    const photoPath = `/uploads/profiles/${req.file.filename}`;

    await pool.request()
      .input('photoPath', sql.VarChar, photoPath)
      .input('id', sql.Int, userId)
      .query('UPDATE users SET profile_photo = @photoPath WHERE id_user = @id');

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        profile_photo: photoPath
      }
    });

  } catch (error) {
    console.error('Update profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile photo',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  getProfile,
  updateProfile,
  updateUser,
  deleteUser,
  updateProfilePhoto
};
