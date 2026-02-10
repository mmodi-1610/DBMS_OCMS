import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET - return all available topics (for the suggestions dropdown)
export async function GET() {
    try {
        const allTopics = await sql`SELECT * FROM course_topic ORDER BY topic_name`;
        return NextResponse.json({ allTopics });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - create a new topic by name and link it to this course
export async function POST(request, { params }) {
    try {
        const { courseId } = await params;
        const { topicName } = await request.json();
        if (!topicName || !topicName.trim()) {
            return NextResponse.json({ error: "topicName is required" }, { status: 400 });
        }

        const name = topicName.trim();

        // Check if topic already exists
        let topicRows = await sql`
      SELECT * FROM course_topic WHERE LOWER(topic_name) = LOWER(${name})
    `;

        let topicId;
        if (topicRows.length > 0) {
            topicId = topicRows[0].topic_id;
        } else {
            // Create new topic
            const newTopic = await sql`
        INSERT INTO course_topic (topic_name) VALUES (${name}) RETURNING *
      `;
            topicId = newTopic[0].topic_id;
        }

        // Link topic to course (ignore if already linked)
        await sql`
      INSERT INTO course_topic_link (course_id, topic_id)
      VALUES (${Number(courseId)}, ${topicId})
      ON CONFLICT DO NOTHING
    `;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - remove a topic link from this course
export async function DELETE(request, { params }) {
    try {
        const { courseId } = await params;
        const { searchParams } = new URL(request.url);
        const topicId = searchParams.get("topicId");
        if (!topicId) {
            return NextResponse.json({ error: "topicId is required" }, { status: 400 });
        }
        await sql`
      DELETE FROM course_topic_link
      WHERE course_id = ${Number(courseId)} AND topic_id = ${Number(topicId)}
    `;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
