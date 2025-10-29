const jwt = require('jsonwebtoken');

// Protect routes - require authentication
const protect = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader); // Debug log
        
        const token = authHeader?.replace('Bearer ', '');
        console.log('Extracted token:', token ? 'Present' : 'Missing'); // Debug log
        
        if (!token) {
            console.log('No token provided'); // Debug log
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded user:', decoded); // Debug log
        // Normalize token payload so controllers can rely on req.user.id
        req.user = {
            id: decoded.userId || decoded.id || decoded.user_id,
            username: decoded.username,
            role: decoded.role
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};

// Admin only - require admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Access denied. Admin only.'
        });
    }
};

module.exports = { protect, adminOnly };