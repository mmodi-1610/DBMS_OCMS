import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log("⏳ Starting database setup...");

  // 1. DROP TABLES (Reverse Dependency Order)
  await sql`DROP TABLE IF EXISTS course_topic_link CASCADE`;
  await sql`DROP TABLE IF EXISTS course_topic CASCADE`;
  await sql`DROP TABLE IF EXISTS course_textbook CASCADE`;
  await sql`DROP TABLE IF EXISTS textbook CASCADE`;
  await sql`DROP TABLE IF EXISTS enroll CASCADE`;
  await sql`DROP TABLE IF EXISTS instructor_course CASCADE`;
  await sql`DROP TABLE IF EXISTS course CASCADE`;
  await sql`DROP TABLE IF EXISTS student CASCADE`;
  await sql`DROP TABLE IF EXISTS instructor CASCADE`;
  await sql`DROP TABLE IF EXISTS university CASCADE`;
  await sql`DROP TABLE IF EXISTS app_user CASCADE`;

  console.log("✅ Old tables dropped.");

  // 2. CREATE TABLES

  // University
  await sql`
    CREATE TABLE university (
      university_id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      location VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // App User
  await sql`
    CREATE TABLE app_user (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin', 'analyst')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Course
  await sql`
    CREATE TABLE course (
      course_id SERIAL PRIMARY KEY,
      course_name VARCHAR(200) NOT NULL,
      program_type VARCHAR(100),
      duration VARCHAR(50),
      university_id INTEGER REFERENCES university(university_id) ON DELETE SET NULL,
      notes TEXT,
      video TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Student
  await sql`
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
    )
  `;

  // Instructor
  await sql`
    CREATE TABLE instructor (
      instructor_id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL,
      name VARCHAR(200) NOT NULL,
      contacts VARCHAR(200),
      university_id INTEGER REFERENCES university(university_id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Instructor-Course Join
  await sql`
    CREATE TABLE instructor_course (
      instructor_id INTEGER REFERENCES instructor(instructor_id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
      PRIMARY KEY (instructor_id, course_id)
    )
  `;

  // Enroll
  await sql`
    CREATE TABLE enroll (
      enroll_id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES student(student_id) ON DELETE CASCADE,
      enroll_date DATE DEFAULT CURRENT_DATE,
      approved BOOLEAN DEFAULT FALSE,
      evaluation INTEGER CHECK (evaluation >= 0 AND evaluation <= 100),
      UNIQUE(course_id, student_id)
    )
  `;

  // Textbook
  await sql`
    CREATE TABLE textbook (
      book_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      author VARCHAR(200),
      publication VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Course-Textbook Join
  await sql`
    CREATE TABLE course_textbook (
      course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES textbook(book_id) ON DELETE CASCADE,
      PRIMARY KEY (course_id, book_id),
      added_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Course Topic
  await sql`
    CREATE TABLE course_topic (
      topic_id SERIAL PRIMARY KEY,
      topic_name VARCHAR(200) UNIQUE NOT NULL
    )
  `;

  // Course Topic Link
  await sql`
    CREATE TABLE course_topic_link (
      course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
      topic_id INTEGER REFERENCES course_topic(topic_id) ON DELETE CASCADE,
      PRIMARY KEY (course_id, topic_id)
    )
  `;

  console.log("✅ Tables created.");

  // 3. SEED DATA

  // Universities
  await sql`
    INSERT INTO university (name, location) VALUES
      ('Global Tech University', 'New York'),
      ('Pacific Institute of Technology', 'San Francisco'),
      ('European Data Academy', 'Berlin'),
      ('Royal College of Computing', 'London'),
      ('Asian Institute of Science', 'Tokyo')
  `;

  // Users
  await sql`
    INSERT INTO app_user (username, password_hash, role) VALUES
      ('admin', 'password', 'admin'),
      ('analyst', 'password', 'analyst'),
      ('john_instructor', 'password', 'instructor'),
      ('jane_instructor', 'password', 'instructor'),
      ('mike_instructor', 'password', 'instructor'),
      ('sarah_instructor', 'password', 'instructor'),
      ('david_instructor', 'password', 'instructor'),
      ('alice_student', 'password', 'student'),
      ('bob_student', 'password', 'student'),
      ('charlie_student', 'password', 'student'),
      ('diana_student', 'password', 'student'),
      ('evan_student', 'password', 'student'),
      ('fiona_student', 'password', 'student'),
      ('george_student', 'password', 'student'),
      ('hannah_student', 'password', 'student'),
      ('mayank_instructor', 'password', 'instructor'),
      ('aditya_instructor', 'password', 'instructor'),
      ('arynan', 'password', 'student'),
      ('ar009', 'password', 'student')
  `;

  // Courses
  await sql`
    INSERT INTO course (course_name, program_type, duration, university_id, notes, video) VALUES
      ('Introduction to Web Development', 'Certificate', '8 weeks', 1, 'HTML/CSS/JS basics', 'https://example.com/webdev'),
      ('Advanced React Patterns', 'Professional', '6 weeks', 2, 'Hooks and Context', 'https://example.com/react'),
      ('Data Science with Python', 'Degree', '12 weeks', 3, 'Pandas and NumPy', 'https://example.com/datascience'),
      ('Cloud Computing Fundamentals', 'Certificate', '10 weeks', 4, 'AWS and Azure', 'https://example.com/cloud'),
      ('Mobile App Development', 'Professional', '8 weeks', 5, 'React Native', 'https://example.com/mobile'),
      ('Database Administration', 'Certificate', '6 weeks', 1, 'Postgres Optimization', 'https://example.com/dba'),
      ('Machine Learning Fundamentals', 'Degree', '14 weeks', 3, 'Neural Networks and Deep Learning', 'https://example.com/ml'),
      ('DevOps Engineering', 'Professional', '10 weeks', 4, 'CI/CD and Infrastructure', 'https://example.com/devops'),
      ('Cybersecurity Essentials', 'Certificate', '8 weeks', 2, 'Network Security and Encryption', 'https://example.com/security'),
      ('Full Stack Development', 'Degree', '16 weeks', 1, 'MERN Stack Complete', 'https://example.com/fullstack'),
      ('UI/UX Design', 'Professional', '6 weeks', 5, 'Figma and User Research', 'https://example.com/uiux'),
      ('Blockchain Development', 'Certificate', '12 weeks', 3, 'Smart Contracts and DApps', 'https://example.com/blockchain')
  `;

  // Instructors
  await sql`
    INSERT INTO instructor (user_id, name, contacts, university_id) VALUES
      (3, 'John Williams', 'john.w@quadbase.edu', 1),
      (4, 'Jane Doe', 'jane.d@quadbase.edu', 2),
      (5, 'Mike Chen', 'mike.c@quadbase.edu', 3),
      (6, 'Sarah Patel', 'sarah.p@quadbase.edu', 4),
      (7, 'David Kim', 'david.k@quadbase.edu', 5),
      (16, 'Mayank Sharma', 'mayank.s@quadbase.edu', 1),
      (17, 'Aditya Kumar', 'aditya.k@quadbase.edu', 2)
  `;

  // Students
  await sql`
    INSERT INTO student (user_id, name, dob, skill_level, city, state, country) VALUES
      (8, 'Alice Johnson', '2000-03-15', 'Intermediate', 'San Francisco', 'CA', 'USA'),
      (9, 'Bob Smith', '1999-07-22', 'Beginner', 'New York', 'NY', 'USA'),
      (10, 'Charlie Brown', '2001-11-08', 'Advanced', 'London', 'England', 'UK'),
      (11, 'Diana Lee', '2002-05-20', 'Intermediate', 'Tokyo', 'Tokyo', 'Japan'),
      (12, 'Evan Garcia', '2000-09-12', 'Beginner', 'Berlin', 'Berlin', 'Germany'),
      (13, 'Fiona Martinez', '2001-02-28', 'Advanced', 'Seattle', 'WA', 'USA'),
      (14, 'George Taylor', '1999-12-05', 'Intermediate', 'Austin', 'TX', 'USA'),
      (15, 'Hannah Wilson', '2002-07-18', 'Beginner', 'Toronto', 'ON', 'Canada'),
      (18, 'Arynan Modi', '2001-08-15', 'Advanced', 'Mumbai', 'Maharashtra', 'India'),
      (19, 'Ar009', '2002-01-09', 'Intermediate', 'Bangalore', 'Karnataka', 'India')
  `;

  // Instructor-Course Assignments
  await sql`
    INSERT INTO instructor_course (instructor_id, course_id) VALUES
      (1, 1), (1, 6), (1, 10),
      (2, 2), (2, 5), (2, 9),
      (3, 3), (3, 7), (3, 12),
      (4, 4), (4, 8),
      (5, 11)
  `;

  // Enrollments
  await sql`
    INSERT INTO enroll (course_id, student_id, enroll_date, approved, evaluation) VALUES
      (1, 1, '2025-01-15', TRUE, 85),
      (2, 1, '2025-02-01', TRUE, 91),
      (3, 1, '2025-03-10', TRUE, 78),
      (1, 2, '2025-01-16', TRUE, 72),
      (4, 2, '2025-02-10', TRUE, 65),
      (6, 2, '2025-03-05', FALSE, NULL),
      (3, 3, '2025-01-20', TRUE, 88),
      (5, 3, '2025-02-15', TRUE, 93),
      (7, 3, '2025-03-12', FALSE, NULL),
      (2, 4, '2025-01-22', TRUE, 82),
      (8, 4, '2025-02-18', TRUE, 76),
      (4, 5, '2025-01-25', TRUE, 68),
      (9, 5, '2025-03-01', FALSE, NULL),
      (10, 6, '2025-02-05', TRUE, 95),
      (11, 6, '2025-02-20', TRUE, 89),
      (6, 7, '2025-02-08', TRUE, 74),
      (12, 7, '2025-03-15', FALSE, NULL),
      (7, 8, '2025-02-12', TRUE, 80),
      (10, 8, '2025-03-18', TRUE, 87)
  `;

  // Topics
  await sql`
    INSERT INTO course_topic (topic_name) VALUES
      ('HTML'), ('CSS'), ('JavaScript'), ('React'), ('Node.js'),
      ('SQL'), ('PostgreSQL'), ('Python'), ('Pandas'), ('NumPy'),
      ('AWS'), ('Azure'), ('Docker'), ('Kubernetes'), ('Linux'),
      ('Git'), ('Mobile UI'), ('Swift'), ('Kotlin'), ('Flutter')
  `;

  // Topic Links
  await sql`
    INSERT INTO course_topic_link (course_id, topic_id) VALUES
      (1, 1), (1, 2), (1, 3),
      (2, 3), (2, 4),
      (3, 8), (3, 9), (3, 10),
      (4, 11), (4, 12),
      (5, 3), (5, 17),
      (6, 6), (6, 7),
      (7, 8), (7, 9),
      (8, 13), (8, 14),
      (9, 15),
      (10, 3), (10, 4), (10, 5),
      (11, 16),
      (12, 8), (12, 18)
  `;

  // Textbooks
  await sql`
    INSERT INTO textbook (name, author, publication) VALUES
      ('HTML and CSS: Design and Build Websites', 'Jon Duckett', 'Wiley'),
      ('JavaScript: The Good Parts', 'Douglas Crockford', 'O''Reilly Media'),
      ('Learning React', 'Alex Banks & Eve Porcello', 'O''Reilly Media'),
      ('Python for Data Analysis', 'Wes McKinney', 'O''Reilly Media'),
      ('Cloud Native DevOps with Kubernetes', 'John Arundel & Justin Domingus', 'O''Reilly Media'),
      ('React Native in Action', 'Nader Dabit', 'Manning'),
      ('PostgreSQL: Up and Running', 'Regina Obe & Leo Hsu', 'O''Reilly Media'),
      ('Hands-On Machine Learning', 'Aurélien Géron', 'O''Reilly Media'),
      ('The DevOps Handbook', 'Gene Kim et al.', 'IT Revolution Press'),
      ('The Web Application Hacker''s Handbook', 'Dafydd Stuttard', 'Wiley'),
      ('Full Stack React', 'Anthony Accomazzo et al.', 'Fullstack.io'),
      ('Don''t Make Me Think', 'Steve Krug', 'New Riders'),
      ('Mastering Blockchain', 'Imran Bashir', 'Packt Publishing')
  `;

  // Textbook Links
  await sql`
    INSERT INTO course_textbook (course_id, book_id) VALUES
      (1, 1), (1, 2),
      (2, 3),
      (3, 4),
      (4, 5),
      (5, 6),
      (6, 7),
      (7, 4), (7, 8),
      (8, 5), (8, 9),
      (9, 10),
      (10, 2), (10, 3), (10, 11),
      (11, 12),
      (12, 13)
  `;

  console.log("🎉 Database setup complete! All tables and data seeded.");
  console.log("📊 Summary:");
  console.log("  - 5 Universities");
  console.log("  - 19 Users (2 admin/analyst, 7 instructors, 10 students)");
  console.log("  - 12 Courses");
  console.log("  - 23 Enrollments");
  console.log("  - 20 Topics");
  console.log("  - 13 Textbooks");
}

setup().catch(console.error);