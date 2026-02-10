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
      INSERT INTO enroll (course_id, student_id, approved)
      VALUES (${courseId}, ${studentId}, false)
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
    const { courseId, studentId } = await request.json();

    if (!courseId || !studentId) {
      return NextResponse.json({ error: "courseId and studentId are required" }, { status: 400 });
    }

    // Only allow cancelling pending (not approved) requests
    await sql`
      DELETE FROM enroll
      WHERE course_id = ${courseId} AND student_id = ${studentId} AND approved = false
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel enrollment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
