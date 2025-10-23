const express = require('express');
const router = express.Router();

// Test route for settings
router.get('/test', (req, res) => {
  res.json({ message: 'Settings route working!' });
});

module.exports = router;
