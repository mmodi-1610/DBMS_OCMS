import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const textbooks = await sql`
      SELECT * FROM textbook ORDER BY name ASC
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

export async function POST(request) {
  const session = await getSession();

  if (!session || session.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, author, publication } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Textbook name is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO textbook (name, author, publication)
      VALUES (${name}, ${author || null}, ${publication || null})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating textbook:", error);
    return NextResponse.json(
      { error: "Failed to create textbook" },
      { status: 500 },
    );
  }
}
