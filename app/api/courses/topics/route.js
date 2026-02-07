import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/* ===================== GET ===================== */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const allTopics = searchParams.get("all");

  // Fetch all topics
  if (allTopics === "true") {
    try {
      const topics = await sql`
        SELECT topic_id, topic_name
        FROM course_topic
        ORDER BY topic_name
      `;
      return NextResponse.json({ topics });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch topics" },
        { status: 500 }
      );
    }
  }

  // Fetch topics for a specific course
  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 }
    );
  }

  try {
    const topics = await sql`
      SELECT t.topic_id, t.topic_name
      FROM course_topic t
      JOIN course_topic_link l
        ON t.topic_id = l.topic_id
      WHERE l.course_id = ${Number(courseId)}
      ORDER BY t.topic_name
    `;

    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

/* ===================== POST ===================== */
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { courseId, topicName } = body;

  if (!courseId || !topicName) {
    return NextResponse.json(
      { error: "courseId and topicName are required" },
      { status: 400 }
    );
  }

  try {
    // Check if topic already exists (case-insensitive)
    const existing = await sql`
      SELECT topic_id
      FROM course_topic
      WHERE LOWER(topic_name) = LOWER(${topicName})
    `;

    let topicId;

    if (existing.length === 0) {
      const inserted = await sql`
        INSERT INTO course_topic (topic_name)
        VALUES (${topicName})
        RETURNING topic_id
      `;
      topicId = inserted[0].topic_id;
    } else {
      topicId = existing[0].topic_id;
    }

    // Link topic to course (idempotent)
    await sql`
      INSERT INTO course_topic_link (course_id, topic_id)
      VALUES (${Number(courseId)}, ${topicId})
      ON CONFLICT DO NOTHING
    `;

    const [topic] = await sql`
      SELECT topic_id, topic_name
      FROM course_topic
      WHERE topic_id = ${topicId}
    `;

    return NextResponse.json({ topic });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add topic" },
      { status: 500 }
    );
  }
}

/* ===================== DELETE ===================== */
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const topicId = searchParams.get("topicId");

  if (!courseId || !topicId) {
    return NextResponse.json(
      { error: "courseId and topicId are required" },
      { status: 400 }
    );
  }

  try {
    await sql`
      DELETE FROM course_topic_link
      WHERE course_id = ${Number(courseId)}
        AND topic_id = ${Number(topicId)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove topic from course" },
      { status: 500 }
    );
  }
}
