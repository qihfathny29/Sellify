const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});