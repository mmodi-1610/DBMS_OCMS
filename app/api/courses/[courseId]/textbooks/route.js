import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET - return all available textbooks (for the suggestions dropdown)
export async function GET() {
  try {
    const allTextbooks = await sql`SELECT * FROM textbook ORDER BY name`;
    return NextResponse.json({ allTextbooks });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - create a new textbook by name and link it to this course
export async function POST(request, { params }) {
  try {
    const { courseId } = await params;
    const { bookName, author, publication } = await request.json();
    if (!bookName || !bookName.trim()) {
      return NextResponse.json({ error: "bookName is required" }, { status: 400 });
    }

    const name = bookName.trim();

    // Check if textbook already exists
    let bookRows = await sql`
      SELECT * FROM textbook WHERE LOWER(name) = LOWER(${name})
    `;

    let bookId;
    if (bookRows.length > 0) {
      bookId = bookRows[0].book_id;
    } else {
      // Create new textbook
      const newBook = await sql`
        INSERT INTO textbook (name, author, publication) 
        VALUES (${name}, ${author || null}, ${publication || null}) 
        RETURNING *
      `;
      bookId = newBook[0].book_id;
    }

    // Link textbook to course (ignore if already linked)
    await sql`
      INSERT INTO course_textbook (course_id, book_id)
      VALUES (${Number(courseId)}, ${bookId})
      ON CONFLICT DO NOTHING
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - remove a textbook link from this course
export async function DELETE(request, { params }) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }
    await sql`
      DELETE FROM course_textbook
      WHERE course_id = ${Number(courseId)} AND book_id = ${Number(bookId)}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
