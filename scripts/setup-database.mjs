import { config } from 'dotenv';
config({ path: '.env.local' }); // This line loads your Neon connection string

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);


// import { neon } from "@neondatabase/serverless";

// const sql = neon(process.env.DATABASE_URL);

async function setup() {
  // Drop tables in reverse dependency order
  await sql`DROP TABLE IF EXISTS enroll CASCADE`;
  await sql`DROP TABLE IF EXISTS instructor_course CASCADE`;
  await sql`DROP TABLE IF EXISTS course CASCADE`;
  await sql`DROP TABLE IF EXISTS student CASCADE`;
  await sql`DROP TABLE IF EXISTS instructor CASCADE`;
  await sql`DROP TABLE IF EXISTS university CASCADE`;
  await sql`DROP TABLE IF EXISTS app_user CASCADE`;

  await sql`
    CREATE TABLE university (
      university_id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      location VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create app_user table
  await sql`
    CREATE TABLE app_user (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin', 'analyst')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create course table
  await sql`
    CREATE TABLE course (
      course_id SERIAL PRIMARY KEY,
      course_name VARCHAR(200) NOT NULL,
      program_type VARCHAR(100),
      duration VARCHAR(50),
      university_id INTEGER REFERENCES university(university_id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create student table
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

  // Create instructor table
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

  // Create instructor_course join table
  await sql`
    CREATE TABLE instructor_course (
      instructor_id INTEGER REFERENCES instructor(instructor_id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
      PRIMARY KEY (instructor_id, course_id)
    )
  `;

  // Create enroll table
  await sql`
    CREATE TABLE enroll (
      enroll_id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES course(course_id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES student(student_id) ON DELETE CASCADE,
      enroll_date DATE DEFAULT CURRENT_DATE,
      evaluation INTEGER CHECK (evaluation >= 0 AND evaluation <= 100),
      UNIQUE(course_id, student_id)
    )
  `;

  // Seed 5 universities
  await sql`
    INSERT INTO university (name, location) VALUES
      ('Global Tech University', 'New York'),
      ('Pacific Institute of Technology', 'San Francisco'),
      ('European Data Academy', 'Berlin'),
      ('Royal College of Computing', 'London'),
      ('Asian Institute of Science', 'Tokyo')
  `;

  // Seed users (admin, analyst, 5 instructors, 5 students)
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
      ('evan_student', 'password', 'student')
  `;

  // Seed 5 courses (linked to universities)
  await sql`
    INSERT INTO course (course_name, program_type, duration, university_id) VALUES
      ('Introduction to Web Development', 'Certificate', '8 weeks', 1),
      ('Advanced React Patterns', 'Professional', '6 weeks', 2),
      ('Data Science with Python', 'Degree', '12 weeks', 3),
      ('Cloud Computing Fundamentals', 'Certificate', '10 weeks', 4),
      ('Mobile App Development', 'Professional', '8 weeks', 5)
  `;

  // Seed 5 students (user_ids 8-12)
  await sql`
    INSERT INTO student (user_id, name, dob, skill_level, city, state, country) VALUES
      (8, 'Alice Johnson', '2000-03-15', 'Intermediate', 'San Francisco', 'CA', 'USA'),
      (9, 'Bob Smith', '1999-07-22', 'Beginner', 'New York', 'NY', 'USA'),
      (10, 'Charlie Brown', '2001-11-08', 'Advanced', 'London', 'England', 'UK'),
      (11, 'Diana Lee', '2002-05-20', 'Intermediate', 'Tokyo', 'Tokyo', 'Japan'),
      (12, 'Evan Garcia', '2000-09-12', 'Beginner', 'Berlin', 'Berlin', 'Germany')
  `;

  // Seed 5 instructors (user_ids 3-7, linked to universities)
  await sql`
    INSERT INTO instructor (user_id, name, contacts, university_id) VALUES
      (3, 'John Williams', 'john.w@quadbase.edu', 1),
      (4, 'Jane Doe', 'jane.d@quadbase.edu', 2),
      (5, 'Mike Chen', 'mike.c@quadbase.edu', 3),
      (6, 'Sarah Patel', 'sarah.p@quadbase.edu', 4),
      (7, 'David Kim', 'david.k@quadbase.edu', 5)
  `;

  // Seed instructor-course assignments
  await sql`
    INSERT INTO instructor_course (instructor_id, course_id) VALUES
      (1, 1), (2, 2), (3, 3), (4, 4), (5, 5)
  `;

  // Seed enrollments
  await sql`
    INSERT INTO enroll (course_id, student_id, enroll_date, evaluation) VALUES
      (1, 1, '2025-01-15', 85),
      (1, 2, '2025-01-16', 72),
      (2, 1, '2025-02-01', 91),
      (3, 3, '2025-01-20', 88),
      (4, 4, '2025-02-10', 65),
      (5, 5, '2025-03-01', NULL),
      (3, 2, '2025-03-05', 55),
      (2, 4, '2025-03-10', 92),
      (4, 5, '2025-03-15', NULL),
      (5, 3, '2025-02-20', 78)
  `;

  console.log("Database setup complete!");
}

setup().catch(console.error);
