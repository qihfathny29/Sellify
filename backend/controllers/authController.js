const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const dbConfig = require('../config/db');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Connect to database
        let pool = await sql.connect(dbConfig);
        
        // Query user
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM users WHERE username = @username AND is_active = 1');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id_user, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            role: user.role,
            user: {
                id: user.id_user,
                username: user.username,
                fullName: user.full_name,
                role: user.role
            }
        });

        // Close connection
        await pool.close();

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const register = async (req, res) => {
    try {
        const { username, password, fullName, role } = req.body;

        if (!username || !password || !fullName || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Connect to database
        let pool = await sql.connect(dbConfig);

        // Check if user exists
        const existingUser = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM users WHERE username = @username');

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('password_hash', sql.VarChar, hashedPassword)
            .input('full_name', sql.VarChar, fullName)
            .input('role', sql.VarChar, role)
            .input('is_active', sql.Bit, 1)
            .query(`INSERT INTO users (username, password_hash, full_name, role, is_active, created_at) 
                    VALUES (@username, @password_hash, @full_name, @role, @is_active, GETDATE())`);

        res.status(201).json({ message: 'User registered successfully' });

        // Close connection
        await pool.close();

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login, register };