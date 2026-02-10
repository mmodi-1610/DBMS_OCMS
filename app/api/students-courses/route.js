import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Returns all courses a student is enrolled in
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ courses: [] });
    }
    const courses = await sql`
      SELECT c.course_id, c.course_name
      FROM enroll e
      JOIN course c ON e.course_id = c.course_id
      WHERE e.student_id = ${Number(studentId)}
        AND e.approved = true
    `;
    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch courses" }, { status: 500 });
  }
}

