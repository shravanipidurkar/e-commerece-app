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

// // MySQL connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'e-commerce-db',
// });

// Middleware to verify JWT and attach user info
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    console.log('✅ Decoded token:', decoded);  // <-- Add this temporarily

    req.user = decoded; // contains user_id, store_id, user_type
    next();
  });
}

// GET /api/feedback - fetch feedback only for the logged-in shop owner's store
router.get('/', authenticateToken, (req, res) => {
  const { store_id, user_type } = req.user;


  // Optional: Only allow shop_owner to access
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
// POST /api/feedback/add
router.post('/add', authenticateToken, (req, res) => {
  console.log('💬 req.user in POST /feedback/add:', req.user);  // already here
  console.log('💬 user_type:', req.user.user_type);             // add this
  console.log('💬 customer_id:', req.user.customer_id);         // add this

  const { rating, product_id, review_description } = req.body;
  const { customer_id, store_id, user_type } = req.user;

  if (user_type !== 'customer') {
    return res.status(403).json({ message: 'Only customers can submit feedback.' });
  }
  const review_date = new Date().toISOString().slice(0, 10);

  const sql = `
    INSERT INTO feedback 
    (review_date, customer_id, rating, product_id, store_id, review_description) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  pool.query(sql, [review_date, customer_id, rating, product_id, store_id, review_description], (err) => {
    if (err) {
      console.error('Error saving feedback:', err);
      return res.status(500).json({ message: 'Failed to save feedback' });
    }

    res.status(201).json({ message: 'Feedback submitted successfully' });
  });
});



module.exports = router;
