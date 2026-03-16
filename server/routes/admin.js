const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');
const admin = require('../config/firebase');

const verifyAdmin = async (req, res, next) => {
  const ADMIN_EMAILS = [
    'sudeep2102@gmail.com',
  ];
  if (!ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.use(verifyToken);
router.use(verifyAdmin);

router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM collections) AS total_collections,
        (SELECT COUNT(*) FROM words) AS total_words,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_this_week,
        (SELECT COUNT(*) FROM words WHERE created_at >= NOW() - INTERVAL '7 days') AS new_words_this_week
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.email,
        u.name,
        u.streak,
        u.created_at,
        COUNT(DISTINCT c.id) AS collection_count,
        COUNT(DISTINCT w.id) AS word_count
      FROM users u
      LEFT JOIN collections c ON c.user_id = u.id
      LEFT JOIN words w ON w.collection_id = c.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const collectionsResult = await pool.query(`
      SELECT c.*, COUNT(w.id) AS word_count
      FROM collections c
      LEFT JOIN words w ON w.collection_id = c.id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [req.params.id]);

    res.json({
      user: userResult.rows[0],
      collections: collectionsResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const userResult = await pool.query('SELECT firebase_uid FROM users WHERE id = $1', [req.params.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const { firebase_uid } = userResult.rows[0];

    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    await admin.auth().deleteUser(firebase_uid);

    res.json({ message: 'User deleted from both Firebase and database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;