const express = require('express');
const cors = require('cors');
const path = require('path');
const sql = require('mssql');
const dbConfig = require('./config/db');
require('dotenv').config();

const app = express();

// Database connection
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log('✅ Connected to SQL Server database');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        // Don't exit the process, just log the error
        // process.exit(1);
    }
}

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes - SEMUA ROUTE AKTIF
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/transactions', require('./routes/transactions')); // Transactions route

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});