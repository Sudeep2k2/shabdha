-- Run this file once to set up your database
-- psql -U postgres -d shabdha -f schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  streak INTEGER DEFAULT 0,
  last_reviewed_at DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  source_language VARCHAR(10) NOT NULL,   -- e.g. "kn" for Kannada
  target_language VARCHAR(10) NOT NULL,   -- e.g. "hi" for Hindi
  created_at TIMESTAMP DEFAULT NOW()
);

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  source_word VARCHAR(500) NOT NULL,
  translation VARCHAR(500) NOT NULL,
  example_sentence TEXT,
  tags TEXT[],                            -- e.g. ARRAY['food', 'travel']
  notes TEXT,
  ease_factor FLOAT DEFAULT 2.5,          -- SM-2 algorithm value
  interval INTEGER DEFAULT 1,             -- days until next review
  next_review DATE DEFAULT CURRENT_DATE,  -- when to show this word in quiz
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_words_collection_id ON words(collection_id);
CREATE INDEX IF NOT EXISTS idx_words_next_review ON words(next_review);