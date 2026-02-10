import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request, { params: paramPromise }) {
  try {
    const { courseId: courseIdStr } = await paramPromise;
    const courseId = Number(courseIdStr);

    if (!courseId || isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const textbooks = await sql`
      SELECT t.book_id, t.name, t.author, t.publication, ct.added_at
      FROM textbook t
      JOIN course_textbook ct ON t.book_id = ct.book_id
      WHERE ct.course_id = ${courseId}
      ORDER BY t.name ASC
    `;

    return NextResponse.json({ textbooks });
  } catch (error) {
    console.error("Error fetching course textbooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch textbooks" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params: paramPromise }) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId: courseIdStr } = await paramPromise;
    const courseId = Number(courseIdStr);

    if (!courseId || isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }
    // Verify instructor owns this course
    const inst = await sql`
      SELECT instructor_id FROM instructor WHERE user_id = ${session.id}
    `;

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

    const { bookId, name, author, publication } = await request.json();

    let bid = bookId;

    // If no bookId, create new textbook
    if (!bid) {
      if (!name) {
        return NextResponse.json(
          { error: "Textbook name is required" },
          { status: 400 },
        );
      }

      const newBook = await sql`
        INSERT INTO textbook (name, author, publication)
        VALUES (${name}, ${author || null}, ${publication || null})
        RETURNING book_id
      `;

      bid = newBook[0].book_id;
    }

    // Link textbook to course
    await sql`
      INSERT INTO course_textbook (course_id, book_id)
      VALUES (${courseId}, ${Number(bid)})
      ON CONFLICT DO NOTHING
    `;

    return NextResponse.json({ success: true, book_id: bid }, { status: 201 });
  } catch (error) {
    console.error("Error adding textbook to course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add textbook" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params: paramPromise }) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId: courseIdStr } = await paramPromise;
    const courseId = Number(courseIdStr);

    if (!courseId || isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const { bookId } = await request.json();

    // Verify instructor owns this course
    const inst = await sql`
      SELECT instructor_id FROM instructor WHERE user_id = ${session.id}
    `;

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

    // Remove textbook from course
    await sql`
      DELETE FROM course_textbook
      WHERE course_id = ${courseId}
        AND book_id = ${Number(bookId)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing textbook from course:", error);
    return NextResponse.json(
      { error: "Failed to remove textbook" },
      { status: 500 },
    );
  }
}
