import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request) {
  try {
    const { name, location } = await request.json();
    const result = await sql`
      INSERT INTO university (name, location)
      VALUES (${name}, ${location})
      RETURNING *
    `;
    return NextResponse.json({ success: true, university: result[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const result = await sql`SELECT * FROM university ORDER BY name ASC`;
  return NextResponse.json(result);
}