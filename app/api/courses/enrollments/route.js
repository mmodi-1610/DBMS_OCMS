import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 }
    );
  }

  try {
    const inst =
      await sql`SELECT instructor_id FROM instructor WHERE user_id = ${session.id}`;

    if (inst.length === 0) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
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

    const rows = await sql`
      SELECT e.enroll_id, e.enroll_date, e.evaluation,
             s.student_id, s.name AS student_name
      FROM enroll e
      JOIN student s ON e.student_id = s.student_id
      WHERE e.course_id = ${Number(courseId)}
      ORDER BY s.name
    `;

    return NextResponse.json({ enrollments: rows });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
