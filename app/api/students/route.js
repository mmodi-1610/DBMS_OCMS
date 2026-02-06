import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  try {
    const { username, password, name } = await request.json();
    
    if (!username || !password || !name) {
      return NextResponse.json({ error: "Username, password, and Full Name are required" }, { status: 400 });
    }

    // Get next IDs
    const maxUserRows = await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM app_user`;
    const maxStudentRows = await sql`SELECT COALESCE(MAX(student_id), 0) AS max_id FROM student`;
    const nextUserId = Number(maxUserRows[0].max_id) + 1;
    const nextStudentId = Number(maxStudentRows[0].max_id) + 1;

    // 1. Insert into app_user (for login)
    await sql`
      INSERT INTO app_user (id, username, password_hash, role)
      VALUES (${nextUserId}, ${username}, ${password}, 'student')
    `;

    // 2. Insert into student table (using the provided Full Name)
    const newStudent = await sql`
      INSERT INTO student (student_id, user_id, name, skill_level)
      VALUES (${nextStudentId}, ${nextUserId}, ${name}, ARRAY['Beginner'])
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      message: "Student created successfully!", 
      student: newStudent[0] 
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const studentRows = await sql`SELECT user_id FROM student WHERE student_id = ${Number(id)}`;
    const userId = studentRows[0]?.user_id;

    await sql`DELETE FROM enroll WHERE student_id = ${Number(id)}`;
    await sql`DELETE FROM student WHERE student_id = ${Number(id)}`;
    
    if (userId) {
      await sql`DELETE FROM app_user WHERE id = ${Number(userId)}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}