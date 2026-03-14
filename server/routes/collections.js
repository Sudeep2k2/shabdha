const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// All routes require auth
router.use(verifyToken);

// GET /api/collections — get all collections for logged-in user
router.get('/', async (req, res) => {
  try {
    // Also return word count and due count per collection
    const result = await pool.query(
      `SELECT
         c.*,
         COUNT(w.id) AS word_count,
         COUNT(CASE WHEN w.next_review <= CURRENT_DATE THEN 1 END) AS due_count
       FROM collections c
       LEFT JOIN words w ON w.collection_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections/:id — get a single collection
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM collections WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections — create a new collection
router.post('/', async (req, res) => {
  const { name, source_language, target_language } = req.body;

  if (!name || !source_language || !target_language) {
    return res.status(400).json({ error: 'name, source_language and target_language are required' });
  }

  if (source_language === target_language) {
    return res.status(400).json({ error: 'Source and target languages must be different' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO collections (user_id, name, source_language, target_language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, name, source_language, target_language]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/collections/:id — rename a collection
router.put('/:id', async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await pool.query(
      `UPDATE collections SET name = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [name, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id — delete a collection (cascades to words)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;