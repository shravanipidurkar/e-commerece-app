const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
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

// ✅ MySQL connection pool
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'e-commerce-db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// }).promise();

// ✅ Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Multer setup for logo & banner
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ POST /api/stores_backup — Create new store
// ✅ POST /api/stores_backup — Create new store
router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      store_name, slug, description, store_email, store_address,
      facebook, instagram, theme, primary_color,
      currency, timezone, business_type, password
    } = req.body;

    // Check if user exists by email
    const [userRows] = await pool.query(
      'SELECT user_id FROM users WHERE email = ?',
      [store_email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user_id = userRows[0].user_id;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file uploads
    const logo = req.files?.logo?.[0] ? `/uploads/${req.files.logo[0].filename}` : null;
    const banner_image = req.files?.banner_image?.[0] ? `/uploads/${req.files.banner_image[0].filename}` : null;

    // Insert into stores_backup
    const [result] = await pool.query(`
      INSERT INTO stores_backup (
        store_name, store_email, store_address,
        slug, description, facebook, instagram,
        theme, primary_color, logo, banner_image,
        currency, timezone, business_type,
        password, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      store_name, store_email, store_address,
      slug, description, facebook, instagram,
      theme, primary_color, logo, banner_image,
      currency, timezone, business_type,
      hashedPassword
    ]);

    const store_id = result.insertId;

    // Update the user with the new store_id using email
    await pool.query(
      'UPDATE users SET store_id = ? WHERE email = ?',
      [store_id, store_email]
    );

    res.status(201).json({ message: '✅ Store created and user updated', store_id });

  } catch (err) {
    console.error('❌ Store creation error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET /api/stores_backup — Get all stores
// GET store info from store_backup using the authenticated user's store_id
router.get('/',async (req, res) => {
  const user = req.user; // Populated by authenticateToken middleware

  if (!user || !user.store_id) {
    return res.status(400).json({ error: 'Invalid user or missing store_id' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM store_backup WHERE store_id = $1',
      [user.store_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found in backup table' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching store from store_backup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ GET /api/stores_backup/:id — Get store by ID
// ✅ GET /api/stores_backup/:id — Get store and its products by store_id
router.get('/:store_id', async (req, res) => {
  try {
    const storeId = req.params.store_id;


    // Fetch store details from stores_backup
    const [storeRows] = await pool.query(
      'SELECT * FROM stores_backup WHERE store_id = ?',
      [storeId]
    );

    if (storeRows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Fetch associated products from products table
    const [productRows] = await pool.query(
      'SELECT * FROM products WHERE store_id = ?',
      [storeId]
    );

    res.json({
      store: storeRows[0],
      products: productRows
    });

  } catch (err) {
    console.error('❌ Error fetching store and products:', err);
    res.status(500).json({ error: err.message });
  }
});
// routes/stores.js or similar
router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const store = await Store.findOne({ slug }); // Sequelize / Mongoose / raw SQL
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json({ store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅ PUT /api/stores_backup/:id — Update store by ID
router.put('/:store_id', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const storeId = req.params.store_id;


    const {
      store_name, slug, description, store_email, store_address,
      facebook, instagram, theme, primary_color,
      currency, timezone, business_type
    } = req.body;

    const logo = req.files?.logo?.[0] ? `/uploads/${req.files.logo[0].filename}` : null;
    const banner_image = req.files?.banner_image?.[0] ? `/uploads/${req.files.banner_image[0].filename}` : null;

    const fields = [
      store_name, store_email, store_address, slug, description,
      facebook, instagram, theme, primary_color, currency,
      timezone, business_type
    ];

    // Conditional parts
    let query = `
      UPDATE stores_backup SET
        store_name = ?, store_email = ?, store_address = ?, slug = ?,
        description = ?, facebook = ?, instagram = ?, theme = ?, primary_color = ?,
        currency = ?, timezone = ?, business_type = ?, updated_at = NOW()
    `;

    if (logo) {
      query += `, logo = ?`;
      fields.push(logo);
    }

    if (banner_image) {
      query += `, banner_image = ?`;
      fields.push(banner_image);
    }

    query += ` WHERE store_id = ?`;
    fields.push(storeId);

    const [result] = await pool.query(query, fields);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found or nothing updated' });
    }

    res.json({ message: '✅ Store updated successfully' });

  } catch (err) {
    console.error('❌ Store update error:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
