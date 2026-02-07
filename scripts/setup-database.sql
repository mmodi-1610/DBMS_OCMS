-- QuadBase Database Schema

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS enroll CASCADE;
DROP TABLE IF EXISTS instructor_course CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS instructor CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

-- Users table for authentication
CREATE TABLE app_user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin', 'analyst')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course table
CREATE TABLE course (
  course_id SERIAL PRIMARY KEY,
  course_name VARCHAR(200) NOT NULL,
  program_type VARCHAR(100),
  duration VARCHAR(50),
  notes TEXT,
  video TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student table
CREATE TABLE student (
  student_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  dob DATE,
  skill_level VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Instructor table
CREATE TABLE instructor (
  instructor_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  contacts VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Instructor-Course assignment (many-to-many)
CREATE TABLE instructor_course (
  instructor_id INTEGER REFERENCES instructor(instructor_id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, course_id)
);

-- Enrollment table
CREATE TABLE enroll (
  enroll_id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES student(student_id) ON DELETE CASCADE,
  enroll_date DATE DEFAULT CURRENT_DATE,
  approved BOOLEAN DEFAULT FALSE,
  evaluation INTEGER CHECK (evaluation >= 0 AND evaluation <= 100),
  UNIQUE(course_id, student_id)
);

-- Seed demo data

-- Users (password is 'password' hashed with bcrypt - we'll handle this in the app)
-- For seeding, we'll use a placeholder hash
INSERT INTO app_user (username, password_hash, role) VALUES
  ('admin', '$2b$10$placeholder_admin_hash', 'admin'),
  ('analyst', '$2b$10$placeholder_analyst_hash', 'analyst'),
  ('john_instructor', '$2b$10$placeholder_instructor_hash', 'instructor'),
  ('jane_instructor', '$2b$10$placeholder_instructor_hash', 'instructor'),
  ('alice_student', '$2b$10$placeholder_student_hash', 'student'),
  ('bob_student', '$2b$10$placeholder_student_hash', 'student'),
  ('charlie_student', '$2b$10$placeholder_student_hash', 'student');

-- Courses
INSERT INTO course (course_name, program_type, duration, notes, video) VALUES
  ('Introduction to Web Development', 'Certificate', '8 weeks', 'Learn HTML, CSS, and JavaScript fundamentals', 'https://example.com/webdev-intro'),
  ('Advanced React Patterns', 'Professional', '6 weeks', 'Deep dive into React hooks, context, and performance', 'https://example.com/react-advanced'),
  ('Data Science with Python', 'Degree', '12 weeks', 'Statistical analysis, pandas, numpy, and machine learning basics', 'https://example.com/data-science'),
  ('Cloud Computing Fundamentals', 'Certificate', '10 weeks', 'AWS, Azure, and GCP basics with hands-on labs', 'https://example.com/cloud-101'),
  ('Mobile App Development', 'Professional', '8 weeks', 'Build iOS and Android apps with React Native', 'https://example.com/mobile-dev'),
  ('Database Administration', 'Certificate', '6 weeks', 'PostgreSQL, MySQL, indexing, and query optimization', 'https://example.com/db-admin'),
  ('Cybersecurity Essentials', 'Degree', '14 weeks', 'Network security, encryption, and ethical hacking', 'https://example.com/cybersec'),
  ('Machine Learning Engineering', 'Professional', '10 weeks', 'Build and deploy ML models in production', 'https://example.com/ml-eng');

-- Students
INSERT INTO student (user_id, name, dob, skill_level, city, state, country) VALUES
  (5, 'Alice Johnson', '2000-03-15', 'Intermediate', 'San Francisco', 'CA', 'USA'),
  (6, 'Bob Smith', '1999-07-22', 'Beginner', 'New York', 'NY', 'USA'),
  (7, 'Charlie Brown', '2001-11-08', 'Advanced', 'London', 'England', 'UK');

-- Instructors
INSERT INTO instructor (user_id, name, contacts) VALUES
  (3, 'John Williams', 'john.w@quadbase.edu'),
  (4, 'Jane Doe', 'jane.d@quadbase.edu');

-- Instructor-Course assignments
INSERT INTO instructor_course (instructor_id, course_id) VALUES
  (1, 1), (1, 2), (1, 5),
  (2, 3), (2, 4), (2, 6);

-- Enrollments
INSERT INTO enroll (course_id, student_id, enroll_date, evaluation) VALUES
  (1, 1, '2025-01-15', 85),
  (1, 2, '2025-01-16', 72),
  (2, 1, '2025-02-01', 91),
  (3, 3, '2025-01-20', 88),
  (4, 2, '2025-02-10', 65),
  (5, 1, '2025-03-01', NULL),
  (6, 3, '2025-02-15', 78),
  (3, 2, '2025-03-05', 55),
  (7, 3, '2025-03-10', 92),
  (8, 1, '2025-03-15', NULL);
