import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, studentId, action } = await request.json();

  if (!courseId || !studentId || !action) {
    return NextResponse.json(
      { error: "courseId, studentId, and action are required" },
      { status: 400 },
    );
  }

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 },
    );
  }

  try {
    // Verify instructor owns this course
    const inst =
      await sql`SELECT instructor_id FROM instructor WHERE user_id = ${session.id}`;

    if (inst.length === 0) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 },
      );
    }

    const instructorId = inst[0].instructor_id;

    const acl = await sql`
      SELECT 1 FROM instructor_course
      WHERE instructor_id = ${instructorId}
        AND course_id = ${Number(courseId)}
    `;

    if (acl.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "approve") {
      // Approve: set approved to true
      await sql`
        UPDATE enroll
        SET approved = true
        WHERE course_id = ${Number(courseId)}
          AND student_id = ${Number(studentId)}
      `;
    } else {
      // Reject: delete the enrollment record
      await sql`
        DELETE FROM enroll
        WHERE course_id = ${Number(courseId)}
          AND student_id = ${Number(studentId)}
      `;
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Approval error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
