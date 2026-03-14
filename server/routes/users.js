const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// GET /api/users/me — get logged-in user's profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/me — update display name
router.put('/me', verifyToken, async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
      [name, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;