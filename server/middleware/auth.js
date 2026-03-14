const admin = require('../config/firebase');
const pool = require('../db');

// Verifies Firebase ID token sent in Authorization header
// Then attaches the user's DB record to req.user
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the token with Firebase
    const decoded = await admin.auth().verifyIdToken(token);

    // Find or create the user in our own DB
    let result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decoded.uid]
    );

    if (result.rows.length === 0) {
      // First time this user hits our API — create their record
      result = await pool.query(
        `INSERT INTO users (firebase_uid, email, name)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [decoded.uid, decoded.email, decoded.name || decoded.email.split('@')[0]]
      );
    }

    req.user = result.rows[0]; // Attach full user record to request
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;