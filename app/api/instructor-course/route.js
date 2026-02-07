import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  const { instructorId, courseId } = await request.json();

  if (!instructorId || !courseId) {
    return NextResponse.json(
      { error: "instructorId and courseId are required" },
      { status: 400 }
    );
  }

  try {
    await sql`
      INSERT INTO instructor_course (instructor_id, course_id)
      VALUES (${instructorId}, ${courseId})
      ON CONFLICT DO NOTHING
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to assign instructor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
