import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request, { params }) {
    try {
        const { courseId } = await params;
        const id = Number(courseId);

        // Fetch course with university name
        const courseResult = await sql`
      SELECT c.*, u.name as university_name
      FROM course c
      LEFT JOIN university u ON c.university_id = u.university_id
      WHERE c.course_id = ${id}
    `;
        if (!courseResult.length) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Fetch topics via course_topic_link junction table
        const topics = await sql`
      SELECT ct.topic_id, ct.topic_name
      FROM course_topic ct
      JOIN course_topic_link ctl ON ct.topic_id = ctl.topic_id
      WHERE ctl.course_id = ${id}
      ORDER BY ct.topic_name
    `;

        // Fetch textbooks via course_textbook junction table
        const textbooks = await sql`
      SELECT t.book_id, t.name, t.author, t.publication
      FROM textbook t
      JOIN course_textbook ct ON t.book_id = ct.book_id
      WHERE ct.course_id = ${id}
      ORDER BY t.name
    `;

        return NextResponse.json({
            course: courseResult[0],
            topics,
            textbooks,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { courseId } = await params;
        const id = Number(courseId);
        const body = await request.json();
        const { courseName, programType, duration, universityId } = body;

        const result = await sql`
      UPDATE course
      SET
        course_name = COALESCE(${courseName || null}, course_name),
        program_type = COALESCE(${programType || null}, program_type),
        duration = COALESCE(${duration || null}, duration),
        university_id = ${universityId ? Number(universityId) : null}
      WHERE course_id = ${id}
      RETURNING *
    `;
        if (!result.length) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }
        return NextResponse.json({ course: result[0] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
