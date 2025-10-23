const roleMiddleware = (roles) => {
  return (req, res, next) => {
    try {
      // Get user role from token (set by authMiddleware)
      const userRole = req.user.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Insufficient permissions.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
          success: false,
          error: 'Authorization error'
      });
    }
  };
};

// Export as named exports for convenience
const admin = roleMiddleware(['admin']);
const kasir = roleMiddleware(['kasir', 'admin']); // Admin can also access kasir routes

module.exports = {
  roleMiddleware,
  admin,
  kasir
};