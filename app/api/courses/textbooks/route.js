import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/courses/textbooks?courseId=X - Get all textbooks for a course
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  try {
    const textbooks = await sql`
      SELECT t.book_id, t.name, t.author, t.publication, t.created_at
      FROM textbook t
      JOIN course_textbook ct ON t.book_id = ct.book_id
      WHERE ct.course_id = ${Number(courseId)}
      ORDER BY t.created_at DESC
    `;

    return NextResponse.json({ textbooks });
  } catch (error) {
    console.error("Error fetching textbooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch textbooks" },
      { status: 500 },
    );
  }
}

// POST /api/courses/textbooks - Add a textbook to a course
export async function POST(request) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, name, author, publication } = await request.json();

  if (!courseId || !name || !author) {
    return NextResponse.json(
      { error: "courseId, name, and author are required" },
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

    // Create textbook or get existing one with same name/author
    const existing = await sql`
      SELECT book_id FROM textbook
      WHERE name = ${name} AND author = ${author}
    `;

    let bookId;
    if (existing.length > 0) {
      bookId = existing[0].book_id;
    } else {
      const result = await sql`
        INSERT INTO textbook (name, author, publication)
        VALUES (${name}, ${author}, ${publication || null})
        RETURNING book_id
      `;
      bookId = result[0].book_id;
    }

    // Check if textbook already added to course
    const alreadyAdded = await sql`
      SELECT 1 FROM course_textbook
      WHERE course_id = ${Number(courseId)}
        AND book_id = ${bookId}
    `;

    if (alreadyAdded.length > 0) {
      return NextResponse.json(
        { error: "Textbook already added to course" },
        { status: 409 },
      );
    }

    // Add textbook to course
    await sql`
      INSERT INTO course_textbook (course_id, book_id)
      VALUES (${Number(courseId)}, ${bookId})
    `;

    // Fetch the newly added textbook
    const textbook = await sql`
      SELECT book_id, name, author, publication, created_at
      FROM textbook
      WHERE book_id = ${bookId}
    `;

    return NextResponse.json(
      { success: true, textbook: textbook[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding textbook:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add textbook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/courses/textbooks - Remove a textbook from a course
export async function DELETE(request) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, bookId } = await request.json();

  if (!courseId || !bookId) {
    return NextResponse.json(
      { error: "courseId and bookId are required" },
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

    // Delete textbook from course
    await sql`
      DELETE FROM course_textbook
      WHERE course_id = ${Number(courseId)}
        AND book_id = ${Number(bookId)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing textbook:", error);
    const message =
      error instanceof Error ? error.message : "Failed to remove textbook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
