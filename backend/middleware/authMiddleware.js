const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
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
        req.user = decoded; // Set user info to request
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};

module.exports = authMiddleware;