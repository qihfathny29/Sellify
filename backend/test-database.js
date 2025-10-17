// test-database.js - Taruh di root backend folder
const sql = require('mssql');
const dbConfig = require('./config/db');

async function testDatabaseConnection() {
    try {
        console.log('🔄 Testing database connection...');
        
        // Connect to database
        let pool = await sql.connect(dbConfig);
        console.log('✅ Database connected successfully!');
        
        // Test basic queries
        console.log('\n📊 Testing basic queries...');
        
        // Count users
        const usersResult = await pool.request().query('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Users count: ${usersResult.recordset[0].count}`);
        
        // Count categories
        const categoriesResult = await pool.request().query('SELECT COUNT(*) as count FROM categories');
        console.log(`📂 Categories count: ${categoriesResult.recordset[0].count}`);
        
        // Count products
        const productsResult = await pool.request().query('SELECT COUNT(*) as count FROM products');
        console.log(`📦 Products count: ${productsResult.recordset[0].count}`);
        
        // Test sample data
        console.log('\n🛍️ Sample products:');
        const sampleProducts = await pool.request().query(`
            SELECT TOP 5 p.name, c.name as category, p.price, p.stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);
        
        sampleProducts.recordset.forEach(product => {
            console.log(`   • ${product.name} (${product.category}) - Rp ${product.price.toLocaleString()} - Stock: ${product.stock}`);
        });
        
        // Close connection
        await pool.close();
        console.log('\n✅ Database test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

// Run test
testDatabaseConnection();