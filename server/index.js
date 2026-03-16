// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const collectionsRouter = require('./routes/collections');
// const wordsRouter = require('./routes/words');
// const quizRouter = require('./routes/quiz');
// const translateRouter = require('./routes/translate');
// const usersRouter = require('./routes/users');

// const app = express();

// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'https://shabdha.vercel.app', // replace with your actual Vercel URL
//   ]
// }))
// app.use(express.json());

// // Routes
// app.use('/api/users', usersRouter);
// app.use('/api/collections', collectionsRouter);
// app.use('/api/words', wordsRouter);
// app.use('/api/quiz', quizRouter);
// app.use('/api/translate', translateRouter);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', message: 'Shabdha API is running' });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong', details: err.message });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Shabdha server running on http://localhost:${PORT}`);
// });


require('dotenv').config();
const express = require('express');
const cors = require('cors');

const collectionsRouter = require('./routes/collections');
const wordsRouter = require('./routes/words');
const quizRouter = require('./routes/quiz');
const translateRouter = require('./routes/translate');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://shabdha.vercel.app',
  ]
}));
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/words', wordsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/translate', translateRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shabdha API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Shabdha server running on http://localhost:${PORT}`);
});