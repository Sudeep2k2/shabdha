const admin = require('firebase-admin');

// Initialize Firebase Admin using environment variables
// (avoids committing your service account JSON to Git)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key comes from .env with escaped newlines — this fixes them
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

module.exports = admin;