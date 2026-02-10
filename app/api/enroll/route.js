import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  const { courseId, studentId } = await request.json();

  if (!courseId || !studentId) {
    return NextResponse.json(
      { error: "courseId and studentId are required" },
      { status: 400 }
    );
  }

  try {
    await sql`
      INSERT INTO enroll (course_id, student_id, enroll_date, approved)
      VALUES (${courseId}, ${studentId}, NULL, false)
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to enroll";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");

    if (!courseId || !studentId) {
      return NextResponse.json({ error: "courseId and studentId are required" }, { status: 400 });
    }

    // Allow deletion of any enrollment (approved or not)
    await sql`
      DELETE FROM enroll
      WHERE course_id = ${courseId} AND student_id = ${studentId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel enrollment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
