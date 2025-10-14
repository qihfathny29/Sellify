const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'SellifyDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false, // Set to true if using Azure
        trustServerCertificate: true, // Set to true for local development
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS02' // Untuk named instance
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

module.exports = config;