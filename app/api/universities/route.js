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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await sql`DELETE FROM university WHERE university_id = ${Number(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}