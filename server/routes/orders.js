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

// ✅ POST: Create new order
router.post('/', async (req, res) => {
  const { customerId, totalAmount, status, storeId, items } = req.body;

  if (!customerId || !totalAmount || !status || !storeId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields (customerId, totalAmount, status, storeId, items)' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (date_ordered, total_amount, customer_id, status, store_id)
       VALUES (NOW(), ?, ?, ?, ?)`,
      [totalAmount, customerId, status, storeId]
    );

    const orderId = orderResult.insertId;

    const itemValues = items.map(item => [
      orderId,
      item.product_id,
      item.quantity,
      storeId
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

// ✅ PUT: Update order status and insert into sales if delivered
router.put('/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status, storeId } = req.body;

  if (!status || !storeId) {
    return res.status(400).json({ error: 'Both status and storeId are required' });
  }

  try {
    const [updateResult] = await pool.query(
      `UPDATE orders o
       JOIN customers c ON o.customer_id = c.customer_id
       SET o.status = ?
       WHERE o.order_id = ? AND c.store_id = ?`,
      [status, orderId, storeId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(403).json({ error: 'Order not found or unauthorized' });
    }

    if (status !== 'Delivered') {
      return res.json({ message: '✅ Order status updated successfully' });
    }

    // Record sales
    const [items] = await pool.query(
      `SELECT 
         oi.product_id, oi.quantity,
         p.price, o.customer_id, o.date_ordered
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       JOIN customers c ON o.customer_id = c.customer_id
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ? AND c.store_id = ?`,
      [orderId, storeId]
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
      storeId,
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
  const { customerId, items, storeId } = req.body;

  if (!customerId || !Array.isArray(items) || items.length === 0 || !storeId) {
    return res.status(400).json({ error: 'Invalid checkout data (customerId, items, storeId)' });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (customer_id, store_id, date_ordered, total_amount, status)
       VALUES (?, ?, NOW(), ?, 'Pending')`,
      [customerId, storeId, totalAmount]
    );

    const orderId = orderResult.insertId;

    const itemInserts = items.map(item => [
      orderId,
      item.product_id,
      item.quantity,
      storeId
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
