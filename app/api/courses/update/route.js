import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(request) {
  const { courseId, notes, video } = await request.json();

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 }
    );
  }

  try {
    await sql`
      UPDATE course
      SET notes = ${notes || null}, video = ${video || null}
      WHERE course_id = ${courseId}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
