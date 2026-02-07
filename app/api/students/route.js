import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    await sql`DELETE FROM enroll WHERE student_id = ${Number(id)}`;
    await sql`DELETE FROM student WHERE student_id = ${Number(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
