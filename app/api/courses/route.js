import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  const { courseName, programType, duration, universityId } = await request.json();

  if (!courseName) {
    return NextResponse.json(
      { error: "courseName is required" },
      { status: 400 }
    );
  }

  try {
    const result = await sql`
      INSERT INTO course (course_name, program_type, duration, university_id)
      VALUES (${courseName}, ${programType}, ${duration}, ${universityId ? Number(universityId) : null})
      RETURNING *
    `;
    return NextResponse.json({ course: result[0] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
