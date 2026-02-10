import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { login } from "@/lib/auth"
import { hashPassword } from "@/lib/password"

export async function POST(request) {
  const body = await request.json()
  const { username, password } = body
  // Force signup role to 'student' regardless of client input
  const role = (body.role || "student").toString()

  if (!username || !password) {
    return NextResponse.json({ error: "username and password required" }, { status: 400 })
  }

  try {
    const existing = await sql`
      SELECT id FROM app_user WHERE username = ${username}
    `
    if (existing.length) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    const inserted = await sql`
      INSERT INTO app_user (username, password_hash, role)
      VALUES (${username}, ${hashedPassword}, ${role})
      RETURNING id, username, role
    `

    const user = inserted[0]
    // If the user is a student, create a corresponding student row
    if (user.role === "student") {
      try {
        await sql`
          INSERT INTO student (user_id, name)
          VALUES (${user.id}, ${user.username})
        `
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create student record"
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }

    // Log the user in by setting the session cookie on the server
    await login(username, password)

    return NextResponse.json({ user })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create user"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
