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
      INSERT INTO enroll (course_id, student_id, enroll_date)
      VALUES (${courseId}, ${studentId}, CURRENT_DATE)
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to enroll";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
