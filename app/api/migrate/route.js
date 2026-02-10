import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// One-time migration to add topics and textbook columns to the course table
export async function POST() {
    try {
        await sql`
      ALTER TABLE course
      ADD COLUMN IF NOT EXISTS topics TEXT,
      ADD COLUMN IF NOT EXISTS textbook TEXT
    `;
        return NextResponse.json({ success: true, message: "Migration complete: topics and textbook columns added." });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
