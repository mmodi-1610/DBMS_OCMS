import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  try {
    const { courseId, studentId } = await request.json();
    if (!courseId || !studentId) {
      return NextResponse.json({ error: "courseId and studentId are required" }, { status: 400 });
    }
    await sql`
      INSERT INTO enroll (course_id, student_id, enroll_date)
      VALUES (${courseId}, ${studentId}, CURRENT_DATE)
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enroll POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to enroll" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");
    if (!studentId || !courseId) {
      return NextResponse.json({ error: "studentId and courseId are required" }, { status: 400 });
    }
    await sql`DELETE FROM enroll WHERE student_id = ${Number(studentId)} AND course_id = ${Number(courseId)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enroll DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to unenroll student" }, { status: 500 });
  }
}
