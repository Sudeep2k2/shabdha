const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

// Helper: verify the collection belongs to the logged-in user
async function getCollection(collectionId, userId) {
  const result = await pool.query(
    'SELECT * FROM collections WHERE id = $1 AND user_id = $2',
    [collectionId, userId]
  );
  return result.rows[0];
}

// GET /api/words/:collectionId — get all words in a collection
router.get('/:collectionId', async (req, res) => {
  const { collectionId } = req.params;
  const { search } = req.query; // optional ?search=query

  try {
    const collection = await getCollection(collectionId, req.user.id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    let query, params;

    if (search) {
      // Search across source word and translation
      query = `
        SELECT * FROM words
        WHERE collection_id = $1
          AND (
            source_word ILIKE $2
            OR translation ILIKE $2
          )
        ORDER BY created_at DESC
      `;
      params = [collectionId, `%${search}%`];
    } else {
      query = `
        SELECT * FROM words
        WHERE collection_id = $1
        ORDER BY created_at DESC
      `;
      params = [collectionId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/words/:collectionId — add a new word
router.post('/:collectionId', async (req, res) => {
  const { collectionId } = req.params;
  const { source_word, translation, example_sentence, tags, notes } = req.body;

  if (!source_word || !translation) {
    return res.status(400).json({ error: 'source_word and translation are required' });
  }

  try {
    const collection = await getCollection(collectionId, req.user.id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    const result = await pool.query(
      `INSERT INTO words
         (collection_id, source_word, translation, example_sentence, tags, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        collectionId,
        source_word.trim(),
        translation.trim(),
        example_sentence || null,
        tags || [],
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/words/word/:wordId — edit a word
router.put('/word/:wordId', async (req, res) => {
  const { wordId } = req.params;
  const { source_word, translation, example_sentence, tags, notes } = req.body;

  try {
    // Verify the word belongs to a collection owned by this user
    const ownerCheck = await pool.query(
      `SELECT w.id FROM words w
       JOIN collections c ON c.id = w.collection_id
       WHERE w.id = $1 AND c.user_id = $2`,
      [wordId, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const result = await pool.query(
      `UPDATE words SET
         source_word = COALESCE($1, source_word),
         translation = COALESCE($2, translation),
         example_sentence = COALESCE($3, example_sentence),
         tags = COALESCE($4, tags),
         notes = COALESCE($5, notes)
       WHERE id = $6
       RETURNING *`,
      [source_word, translation, example_sentence, tags, notes, wordId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/words/word/:wordId — delete a word
router.delete('/word/:wordId', async (req, res) => {
  const { wordId } = req.params;

  try {
    const ownerCheck = await pool.query(
      `SELECT w.id FROM words w
       JOIN collections c ON c.id = w.collection_id
       WHERE w.id = $1 AND c.user_id = $2`,
      [wordId, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    await pool.query('DELETE FROM words WHERE id = $1', [wordId]);
    res.json({ message: 'Word deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;