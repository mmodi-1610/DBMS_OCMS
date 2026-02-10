-- Add Textbook Schema
-- This migration adds support for course textbooks

-- Create textbook table
CREATE TABLE IF NOT EXISTS textbook (
  book_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publication VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create course_textbook junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS course_textbook (
  course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES textbook(book_id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, book_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_textbook_course_id ON course_textbook(course_id);
CREATE INDEX IF NOT EXISTS idx_course_textbook_book_id ON course_textbook(book_id);
