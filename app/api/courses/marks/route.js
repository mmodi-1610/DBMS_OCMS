import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { courseId, studentId, evaluation } = body;

  if (
    !courseId ||
    !studentId ||
    typeof evaluation !== "number"
  ) {
    return NextResponse.json(
      { error: "courseId, studentId and numeric evaluation are required" },
      { status: 400 }
    );
  }

  try {
    // Get instructor id
    const inst = await sql`
      SELECT instructor_id
      FROM instructor
      WHERE user_id = ${session.id}
    `;

    if (inst.length === 0) {
      return NextResponse.json(
        { error: "Instructor record not found" },
        { status: 404 }
      );
    }

    const instructorId = inst[0].instructor_id;

    // ACL check
    const acl = await sql`
      SELECT 1
      FROM instructor_course
      WHERE instructor_id = ${instructorId}
        AND course_id = ${Number(courseId)}
    `;

    if (acl.length === 0) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update evaluation
    const result = await sql`
      UPDATE enroll
      SET evaluation = ${evaluation}
      WHERE course_id = ${Number(courseId)}
        AND student_id = ${Number(studentId)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update marks";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
