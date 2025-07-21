const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
// const pool = require('../routes/db');
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'e-commerce-db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// // DB pool
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'e-commerce-db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// ✅ GET: Get summary dashboard counts (total stores, customers, products, sales)
router.get('/summary', async (req, res) => {
  try {
    const [[{ total_stores }]] = await pool.query('SELECT COUNT(*) AS total_stores FROM stores');
    const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) AS total_customers FROM customers');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ total_sales }]] = await pool.query('SELECT IFNULL(SUM(total_amount), 0) AS total_sales FROM orders');

    res.json({ total_stores, total_customers, total_products, total_sales });
  } catch (err) {
    console.error('Error fetching summary:', err.message);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ✅ GET: Enhanced list of stores with filters and sorting
router.get('/stores', async (req, res) => {
    const { search = '', status, sort = 'desc' } = req.query;
  
    const filters = [];
    const values = [];
  
    if (search) {
      filters.push(`(s.store_name LIKE ? OR u.email LIKE ?)`);
      values.push(`%${search}%`, `%${search}%`);
    }
  
    if (status && ['enabled', 'disabled'].includes(status)) {
      filters.push(`s.store_status = ?`);
      values.push(status);
    }
  
    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  
    const sql = `
      SELECT s.id, s.store_name, s.store_email, s.store_status, u.email AS owner_email
      FROM stores s
      JOIN users u ON s.id = u.store_id AND u.user_type = 'shop_owner'
      ${whereClause}
      ORDER BY s.id ${sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
    `;
  
    try {
      const [results] = await pool.query(sql, values);
      res.json(results);
    } catch (err) {
      console.error('Error fetching store list:', err.message);
      res.status(500).json({ error: 'Failed to fetch stores' });
    }
  });
  


// ✅ PUT: Update store status (enable/disable)
router.put('/stores/:storeId/status', async (req, res) => {
  const { storeId } = req.params;
  const { status } = req.body; // Expected to be 'enabled' or 'disabled'

  if (!['enabled', 'disabled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const sql = `UPDATE stores SET store_status = ? WHERE id = ?`;

  try {
    await pool.query(sql, [status, storeId]);
    res.json({ message: `Store ${status} successfully` });
  } catch (err) {
    console.error('Error updating store status:', err.message);
    res.status(500).json({ error: 'Failed to update status' });
  }
});


module.exports = router;
