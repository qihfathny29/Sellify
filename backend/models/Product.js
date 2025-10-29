const sql = require('mssql');
const dbConfig = require('../config/db');

class Product {
  static async findAll(filters = {}) {
    try {
      const pool = await sql.connect(dbConfig);
      const request = pool.request();
      
      let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
      
      if (filters.search) {
        query += ' AND (p.name LIKE @search OR p.barcode LIKE @search)';
        request.input('search', sql.NVarChar, '%' + filters.search + '%');
      }
      
      if (filters.category_id) {
        query += ' AND p.category_id = @category_id';
        request.input('category_id', sql.Int, filters.category_id);
      }
      
      query += ' ORDER BY p.created_at DESC';
      
      const result = await request.query(query);
      
      return { products: result.recordset, pagination: { page: 1, limit: 100, total: result.recordset.length, totalPages: 1 } };
    } catch (error) {
      console.error('Product.findAll error:', error);
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().input('id', sql.Int, id).query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = @id');
      return result.recordset[0];
    } catch (error) {
      console.error('Product.findById error:', error);
      throw error;
    }
  }
  
  static async create(data) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('name', sql.NVarChar, data.name)
        .input('category_id', sql.Int, data.category_id)
        .input('price', sql.Decimal(10, 2), data.price)
        .input('cost_price', sql.Decimal(10, 2), data.cost_price || 0)
        .input('stock', sql.Int, data.stock)
        .input('unit', sql.NVarChar(50), data.unit || 'pcs')
        .input('min_stock', sql.Int, data.min_stock || 5)
        .input('description', sql.Text, data.description || '')
        .input('barcode', sql.NVarChar(100), data.barcode || null)
        .input('image', sql.NVarChar, data.image || null)
        .query('INSERT INTO products (name, category_id, price, cost, stock, unit, min_stock, description, barcode, image_url, is_active, created_at) OUTPUT INSERTED.id VALUES (@name, @category_id, @price, @cost_price, @stock, @unit, @min_stock, @description, @barcode, @image, 1, GETDATE())');
      return result.recordset[0].id;
    } catch (error) {
      console.error('Product.create error:', error);
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, data.name)
        .input('category_id', sql.Int, data.category_id)
        .input('price', sql.Decimal(10, 2), data.price)
        .input('stock', sql.Int, data.stock)
        .input('unit', sql.NVarChar(50), data.unit)
        .input('description', sql.Text, data.description)
        .input('image_url', sql.NVarChar, data.image_url)
        .query('UPDATE products SET name = @name, category_id = @category_id, price = @price, stock = @stock, unit = @unit, description = @description, image_url = @image_url, updated_at = GETDATE() WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Product.update error:', error);
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const pool = await sql.connect(dbConfig);
      await pool.request().input('id', sql.Int, id).query('UPDATE products SET is_active = 0, updated_at = GETDATE() WHERE id = @id');
      return true;
    } catch (error) {
      console.error('Product.delete error:', error);
      throw error;
    }
  }
  
  static async bulkDelete(ids) {
    try {
      const pool = await sql.connect(dbConfig);
      const idsString = ids.join(',');
      await pool.request().query('UPDATE products SET is_active = 0, updated_at = GETDATE() WHERE id IN (' + idsString + ')');
      return ids.length;
    } catch (error) {
      console.error('Product.bulkDelete error:', error);
      throw error;
    }
  }
}

module.exports = Product;
