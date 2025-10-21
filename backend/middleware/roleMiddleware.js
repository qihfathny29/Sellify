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

module.exports = roleMiddleware;  // ← Should be default export, not named export