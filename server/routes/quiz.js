const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');
const { calculateNextReview } = require('../algorithms/sm2');

router.use(verifyToken);

// GET /api/quiz/:collectionId/due — get all words due for review today
router.get('/:collectionId/due', async (req, res) => {
  const { collectionId } = req.params;

  try {
    // Verify collection belongs to user
    const colCheck = await pool.query(
      'SELECT * FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, req.user.id]
    );
    if (colCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Words where next_review is today or earlier
    const result = await pool.query(
      `SELECT * FROM words
       WHERE collection_id = $1 AND next_review <= CURRENT_DATE
       ORDER BY next_review ASC`,
      [collectionId]
    );

    res.json({
      collection: colCheck.rows[0],
      due_words: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/review/:wordId — submit a review result
// Body: { rating: 'easy' | 'hard' | 'forgot' }
router.post('/review/:wordId', async (req, res) => {
  const { wordId } = req.params;
  const { rating } = req.body;

  if (!['easy', 'hard', 'forgot'].includes(rating)) {
    return res.status(400).json({ error: 'rating must be easy, hard, or forgot' });
  }

  try {
    // Verify ownership
    const wordResult = await pool.query(
      `SELECT w.* FROM words w
       JOIN collections c ON c.id = w.collection_id
       WHERE w.id = $1 AND c.user_id = $2`,
      [wordId, req.user.id]
    );

    if (wordResult.rows.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const word = wordResult.rows[0];

    // Run SM-2 calculation
    const { easeFactor, interval, nextReview, mastered } = calculateNextReview(
      word.ease_factor,
      word.interval,
      rating
    );

    // Update word with new SM-2 values
    const updated = await pool.query(
      `UPDATE words
       SET ease_factor = $1, interval = $2, next_review = $3, mastered = $4
       WHERE id = $5
       RETURNING *`,
      [easeFactor, interval, nextReview, mastered, wordId]
    );

    // Update user streak
    await updateStreak(req.user.id);

    res.json({
      word: updated.rows[0],
      next_review: nextReview,
      mastered,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: update streak for a user
async function updateStreak(userId) {
  const user = await pool.query(
    'SELECT streak, last_reviewed_at FROM users WHERE id = $1',
    [userId]
  );

  const { streak, last_reviewed_at } = user.rows[0];
  const today = new Date().toISOString().split('T')[0];

  if (last_reviewed_at === null) {
    // First ever review
    await pool.query(
      'UPDATE users SET streak = 1, last_reviewed_at = $1 WHERE id = $2',
      [today, userId]
    );
  } else {
    const lastDate = new Date(last_reviewed_at);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (last_reviewed_at.toISOString?.().split('T')[0] === today ||
        String(last_reviewed_at).split('T')[0] === today) {
      // Already reviewed today — no change
      return;
    } else if (String(last_reviewed_at).split('T')[0] === yesterdayStr) {
      // Reviewed yesterday — continue streak
      await pool.query(
        'UPDATE users SET streak = streak + 1, last_reviewed_at = $1 WHERE id = $2',
        [today, userId]
      );
    } else {
      // Missed a day — reset streak
      await pool.query(
        'UPDATE users SET streak = 1, last_reviewed_at = $1 WHERE id = $2',
        [today, userId]
      );
    }
  }
}

// GET /api/quiz/:collectionId/stats — progress stats for a collection
router.get('/:collectionId/stats', async (req, res) => {
  const { collectionId } = req.params;

  try {
    const colCheck = await pool.query(
      'SELECT * FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, req.user.id]
    );
    if (colCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const stats = await pool.query(
      `SELECT
         COUNT(*) AS total_words,
         COUNT(CASE WHEN mastered = TRUE THEN 1 END) AS mastered_count,
         COUNT(CASE WHEN mastered = FALSE THEN 1 END) AS learning_count,
         COUNT(CASE WHEN next_review <= CURRENT_DATE THEN 1 END) AS due_today,
         COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS added_this_week
       FROM words
       WHERE collection_id = $1`,
      [collectionId]
    );

    const userStats = await pool.query(
      'SELECT streak FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      ...stats.rows[0],
      streak: userStats.rows[0].streak,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;