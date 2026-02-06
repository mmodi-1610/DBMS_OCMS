import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    // Get max user_id and student_id
    const maxUserRows = await sql`SELECT COALESCE(MAX(id), 0) AS max_user_id FROM app_user`;
    const maxStudentRows = await sql`SELECT COALESCE(MAX(student_id), 0) AS max_student_id FROM student`;
    const nextUserId = maxUserRows[0].max_user_id + 1;
    const nextStudentId = maxStudentRows[0].max_student_id + 1;

    // Insert into app_user (for login)
    await sql`
      INSERT INTO app_user (id, username, password_hash, role)
      VALUES (${nextUserId}, ${username}, ${password}, 'student')
    `;

    // Insert into student table
    const newStudent = await sql`
      INSERT INTO student (student_id, user_id, name)
      VALUES (${nextStudentId}, ${nextUserId}, ${username})
      RETURNING *
    `;
    return NextResponse.json({ 
      success: true, 
      message: "Student added to database!", 
      student: newStudent[0] 
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add to database" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const students = await sql`SELECT * FROM student ORDER BY name ASC`;
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    // Remove enrollments
    await sql`DELETE FROM enroll WHERE student_id = ${Number(id)}`;
    // Get user_id for this student
    const studentRows = await sql`SELECT user_id FROM student WHERE student_id = ${Number(id)}`;
    const userId = studentRows[0]?.user_id;
    // Remove student
    await sql`DELETE FROM student WHERE student_id = ${Number(id)}`;
    // Remove app_user
    if (userId !== undefined && userId !== null) {
      await sql`DELETE FROM app_user WHERE id = ${Number(userId)}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}