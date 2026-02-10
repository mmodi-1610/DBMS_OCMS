import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    // --- LOGIC 1: ADD NEW INSTRUCTOR ---
    if (body.username && body.password) {
      const { username, password, name, contacts, universityId } = body;

      if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

      const maxUserRows = await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM app_user`;
      const maxInstrRows = await sql`SELECT COALESCE(MAX(instructor_id), 0) AS max_id FROM instructor`;
      const nextUserId = Number(maxUserRows[0].max_id) + 1;
      const nextInstrId = Number(maxInstrRows[0].max_id) + 1;

      await sql`
        INSERT INTO app_user (id, username, password_hash, role)
        VALUES (${nextUserId}, ${username}, ${password}, 'instructor')
      `;

      const newInstructor = await sql`
      INSERT INTO instructor (instructor_id, user_id, name, contacts, university_id)
      VALUES (${nextInstrId}, ${nextUserId}, ${name}, ${contacts || null}, ${universityId ? Number(universityId) : null})
      RETURNING *
      `;

      return NextResponse.json({ success: true, instructor: newInstructor[0] });
    }

    // --- LOGIC 2: ASSIGN INSTRUCTOR TO COURSE ---
    if (body.instructorId && body.courseId) {
      const { instructorId, courseId } = body;

      // Check if assignment already exists
      const existing = await sql`
        SELECT 1 FROM instructor_course 
        WHERE instructor_id = ${Number(instructorId)} AND course_id = ${Number(courseId)}
      `;

      if (existing.length > 0) {
        return NextResponse.json({ error: "Instructor is already assigned to this course" }, { status: 400 });
      }

      await sql`
        INSERT INTO instructor_course (instructor_id, course_id)
        VALUES (${Number(instructorId)}, ${Number(courseId)})
      `;

      return NextResponse.json({ success: true, message: "Assigned successfully" });
    }

    // --- IF NEITHER CONDITION IS MET ---
    return NextResponse.json({ error: "Invalid request: Provide instructor details or IDs" }, { status: 400 });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get("instructorId");
    const courseId = searchParams.get("courseId");

    if (!instructorId || !courseId) {
      return NextResponse.json({ error: "instructorId and courseId are required" }, { status: 400 });
    }

    await sql`
      DELETE FROM instructor_course 
      WHERE instructor_id = ${Number(instructorId)} AND course_id = ${Number(courseId)}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get("instructorId");

    // If no ID is provided, you could return all assignments or an error
    if (!instructorId) {
      return NextResponse.json({ error: "Instructor ID required" }, { status: 400 });
    }

    // This query joins the assignment table with the course table to get names
    const assignedCourses = await sql`
      SELECT c.course_id, c.course_name 
      FROM instructor_course ic
      JOIN course c ON ic.course_id = c.course_id
      WHERE ic.instructor_id = ${Number(instructorId)}
    `;

    return NextResponse.json({ courses: assignedCourses });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
