const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
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

// JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// GET /api/feedback (Shop owner)
router.get('/', authenticateToken, (req, res) => {
  const { store_id, user_type } = req.user;

  if (user_type !== 'shop_owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const sql = `
    SELECT 
      f.feedback_id, 
      f.review_date, 
      f.rating, 
      f.review_description, 
      c.customer_name, 
      p.product_name
    FROM feedback f
    JOIN customers c ON f.customer_id = c.customer_id
    JOIN products p ON f.product_id = p.product_id
    WHERE f.store_id = ?
    ORDER BY f.review_date DESC
  `;

  pool.query(sql, [store_id], (err, results) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// POST /api/feedback/add (Customer)
router.post('/add', authenticateToken, (req, res) => {
  const { rating, product_id, review_description } = req.body;
  const { user_id, store_id, user_type } = req.user;

  if (user_type !== 'customer') {
    return res.status(403).json({ message: 'Only customers can submit feedback.' });
  }

  // First, get the customer_id for this user
  const getCustomerSql = `SELECT customer_id FROM customers WHERE user_id = ? LIMIT 1`;
  pool.query(getCustomerSql, [user_id], (err, customerResults) => {
    if (err || customerResults.length === 0) {
      console.error('Failed to get customer_id:', err);
      return res.status(500).json({ message: 'Customer not found' });
    }

    const customer_id = customerResults[0].customer_id;
    const review_date = new Date().toISOString().slice(0, 10);

    const insertSql = `
      INSERT INTO feedback 
      (review_date, customer_id, rating, product_id, store_id, review_description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(insertSql, [review_date, customer_id, rating, product_id, store_id, review_description], (err2) => {
      if (err2) {
        console.error('Error saving feedback:', err2);
        return res.status(500).json({ message: 'Failed to save feedback' });
      }

      res.status(201).json({ message: 'Feedback submitted successfully' });
    });
  });
});

module.exports = router;
