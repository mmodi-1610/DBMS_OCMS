import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Get all courses
    const courses = await sql`
      SELECT course_id, course_name FROM course ORDER BY course_id
    `;

    // Get all students with their enrollments and grades
    const rows = await sql`
      SELECT
        s.student_id,
        s.name AS student_name,
        s.skill_level,
        c.course_id,
        c.course_name,
        e.evaluation,
        e.enroll_date
      FROM student s
      LEFT JOIN enroll e ON s.student_id = e.student_id
      LEFT JOIN course c ON e.course_id = c.course_id
      ORDER BY s.student_id, c.course_id
    `;

    // Group by student
    const studentMap = new Map();
    for (const row of rows) {
      if (!studentMap.has(row.student_id)) {
        studentMap.set(row.student_id, {
          student_id: row.student_id,
          student_name: row.student_name,
          skill_level: row.skill_level,
          grades: {},
        });
      }
      if (row.course_id) {
        studentMap.get(row.student_id).grades[row.course_id] = {
          evaluation: row.evaluation,
          enroll_date: row.enroll_date,
        };
      }
    }

    const students = Array.from(studentMap.values());

    return NextResponse.json({ courses, students });
  } catch (error) {
    console.error("Matrix API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matrix data" },
      { status: 500 }
    );
  }
}
