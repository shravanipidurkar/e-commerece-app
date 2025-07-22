const mysql = require('mysql2/promise');
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

module.exports = async (req, res) => {
  const { method, query, body } = req;

  if (req.url.startsWith('/summary') && method === 'GET') {
    try {
      const [[{ total_stores }]] = await pool.query('SELECT COUNT(*) AS total_stores FROM stores');
      const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) AS total_customers FROM customers');
      const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
      const [[{ total_sales }]] = await pool.query('SELECT IFNULL(SUM(total_amount), 0) AS total_sales FROM orders');

      return res.status(200).json({ total_stores, total_customers, total_products, total_sales });
    } catch (err) {
      console.error('Error fetching summary:', err.message);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }
  }

  if (req.url.startsWith('/stores') && method === 'GET') {
    const { search = '', status, sort = 'desc' } = query;
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
      return res.status(200).json(results);
    } catch (err) {
      console.error('Error fetching store list:', err.message);
      return res.status(500).json({ error: 'Failed to fetch stores' });
    }
  }

  if (req.url.match(/^\/stores\/\d+\/status$/) && method === 'PUT') {
    const storeId = req.url.split('/')[2];
    const { status } = body;

    if (!['enabled', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
      await pool.query(`UPDATE stores SET store_status = ? WHERE id = ?`, [status, storeId]);
      return res.status(200).json({ message: `Store ${status} successfully` });
    } catch (err) {
      console.error('Error updating store status:', err.message);
      return res.status(500).json({ error: 'Failed to update status' });
    }
  }

  res.status(404).json({ error: 'Endpoint not found' });
};
