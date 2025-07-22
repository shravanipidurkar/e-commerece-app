const express = require('express');
const router = express.Router();
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

// ✅ GET: All orders for a store
router.get('/', async (req, res) => {
  const storeId = req.query.storeId;
  if (!storeId) return res.status(400).json({ message: 'Missing storeId' });

  try {
    const [results] = await pool.query(
      `SELECT o.order_id, o.date_ordered, o.total_amount, o.status,
              COALESCE(c.customer_name, 'Guest') AS customer_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.store_id = ?`,
      [storeId]
    );
    res.json(results);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
});

// ✅ POST: Create new order (corrected snake_case usage)
router.post('/', async (req, res) => {
  const { customer_id, total_amount, status, store_id, items } = req.body;

  if (!customer_id || !total_amount || !status || !store_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields (customer_id, total_amount, status, store_id, items)'
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (date_ordered, total_amount, customer_id, status, store_id)
       VALUES (NOW(), ?, ?, ?, ?)`,
      [total_amount, customer_id, status, store_id]
    );

    const orderId = orderResult.insertId;

    const itemValues = items.map(item => [
      orderId,
      item.product_id,
      item.quantity,
      store_id
    ]);

    await conn.query(
      `INSERT INTO order_items (order_id, product_id, quantity, store_id) VALUES ?`,
      [itemValues]
    );

    await conn.commit();
    res.status(201).json({ message: '✅ Order and items saved successfully', orderId });
  } catch (err) {
    await conn.rollback();
    console.error('❌ Error inserting order:', err.message);
    res.status(500).json({ error: 'Database error while inserting order' });
  } finally {
    conn.release();
  }
});

// ✅ PUT: Update order status and record sales if delivered
router.put('/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status, store_id } = req.body;

  if (!status || !store_id) {
    return res.status(400).json({ error: 'Both status and store_id are required' });
  }

  try {
    const [updateResult] = await pool.query(
      `UPDATE orders o
       JOIN customers c ON o.customer_id = c.customer_id
       SET o.status = ?
       WHERE o.order_id = ? AND c.store_id = ?`,
      [status, orderId, store_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(403).json({ error: 'Order not found or unauthorized' });
    }

    if (status !== 'Delivered') {
      return res.json({ message: '✅ Order status updated successfully' });
    }

    const [items] = await pool.query(
      `SELECT 
         oi.product_id, oi.quantity,
         p.price, o.customer_id, o.date_ordered
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       JOIN customers c ON o.customer_id = c.customer_id
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ? AND c.store_id = ?`,
      [orderId, store_id]
    );

    if (!items.length) {
      return res.status(404).json({ error: 'No order items found for this order' });
    }

    const salesValues = items.map(item => [
      item.date_ordered,
      'online',
      item.product_id,
      item.quantity,
      item.price,
      item.price * item.quantity,
      store_id,
      item.customer_id
    ]);

    await pool.query(
      `INSERT INTO sales (
         sale_date, sale_type, product_id,
         quantity_sold, unit_price_at_sale,
         total_sale_amount, store_id, customer_id
       ) VALUES ?`,
      [salesValues]
    );

    res.json({ message: '✅ Order marked as Delivered and sales recorded' });

  } catch (err) {
    console.error('❌ Error updating status/inserting sales:', err.message);
    res.status(500).json({ error: 'Failed to update status or record sales' });
  }
});

// ✅ GET: Products for a store
router.get('/products', async (req, res) => {
  const storeId = req.query.storeId;
  if (!storeId) return res.status(400).json({ error: 'storeId is required in query' });

  try {
    const [results] = await pool.query(
      `SELECT product_id, product_name, price FROM products WHERE store_id = ?`,
      [storeId]
    );
    res.json(results);
  } catch (err) {
    console.error('🔴 Error fetching products:', err.message);
    res.status(500).json({ error: 'Database error while fetching products' });
  }
});

// ✅ GET: Customers for a store
router.get('/customers_orders', async (req, res) => {
  const storeId = req.query.storeId;
  if (!storeId) return res.status(400).json({ error: 'storeId is required in query' });

  try {
    const [results] = await pool.query(
      `SELECT customer_id, customer_name FROM customers WHERE store_id = ?`,
      [storeId]
    );
    res.json(results);
  } catch (err) {
    console.error('🔴 Error fetching customers:', err.message);
    res.status(500).json({ error: 'Database error while fetching customers' });
  }
});

// ✅ POST: Checkout (alternative order placement)
router.post('/checkout', async (req, res) => {
  const { customer_id, items, store_id } = req.body;

  if (!customer_id || !Array.isArray(items) || items.length === 0 || !store_id) {
    return res.status(400).json({ error: 'Invalid checkout data (customer_id, items, store_id)' });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (customer_id, store_id, date_ordered, total_amount, status)
       VALUES (?, ?, NOW(), ?, 'Pending')`,
      [customer_id, store_id, totalAmount]
    );

    const orderId = orderResult.insertId;

    const itemInserts = items.map(item => [
      orderId,
      item.product_id,
      item.quantity,
      store_id
    ]);

    await conn.query(
      `INSERT INTO order_items (order_id, product_id, quantity, store_id) VALUES ?`,
      [itemInserts]
    );

    await conn.commit();
    res.status(201).json({ message: '✅ Checkout successful', orderId });
  } catch (err) {
    await conn.rollback();
    console.error('❌ Checkout Error:', err.message);
    res.status(500).json({ error: 'Checkout failed' });
  } finally {
    conn.release();
  }
});

module.exports = router;
