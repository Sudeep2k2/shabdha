const express = require('express');
const router = express.Router();
const axios = require('axios');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

// GET /api/translate?word=hello&from=en&to=kn
// Proxies to MyMemory API — auto-fills translation when user types a word
router.get('/', async (req, res) => {
  const { word, from, to } = req.query

  if (!word || !from || !to) {
    return res.status(400).json({ error: 'word, from, and to are required' })
  }

  if (from === to) {
    return res.status(400).json({ error: 'from and to languages must be different' })
  }

  try {
    const response = await axios.post('https://libretranslate.com/translate', {
      q: word,
      source: from,
      target: to,
      format: 'text',
      api_key: ''
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    })

    res.json({
      original: word,
      translation: response.data.translatedText,
      from,
      to,
    })
  } catch (err) {
    // Fallback to MyMemory if LibreTranslate fails
    try {
      const fallback = await axios.get('https://api.mymemory.translated.net/get', {
        params: { q: word, langpair: `${from}|${to}` },
        timeout: 5000,
      })
      res.json({
        original: word,
        translation: fallback.data.responseData.translatedText,
        from,
        to,
      })
    } catch {
      res.status(500).json({ error: 'Translation failed' })
    }
  }
})

// GET /api/translate/languages — return supported languages list
// Used to populate the language dropdowns when creating a collection
router.get('/languages', async (req, res) => {
  // MyMemory supports ISO 639-1 codes. This is a curated list of commonly used languages.
  const languages = [
    { code: 'af', name: 'Afrikaans' },
    { code: 'sq', name: 'Albanian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hy', name: 'Armenian' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'eu', name: 'Basque' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'hr', name: 'Croatian' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'en', name: 'English' },
    { code: 'et', name: 'Estonian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'gl', name: 'Galician' },
    { code: 'ka', name: 'Georgian' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ht', name: 'Haitian Creole' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ga', name: 'Irish' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'ko', name: 'Korean' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'ms', name: 'Malay' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mt', name: 'Maltese' },
    { code: 'mr', name: 'Marathi' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'ne', name: 'Nepali' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'es', name: 'Spanish' },
    { code: 'sw', name: 'Swahili' },
    { code: 'sv', name: 'Swedish' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'uz', name: 'Uzbek' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'cy', name: 'Welsh' },
  ];

  res.json(languages);
});

module.exports = router;