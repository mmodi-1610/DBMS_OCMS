import { cookies } from "next/headers";
import { sql } from "./db";
import { verifyPassword } from "./password";

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("quadbase_session");
  if (!session?.value) return null;

  try {
    const parsed = JSON.parse(session.value);
    return parsed;
  } catch {
    return null;
  }
}

export async function login(username, password) {
  try {
    const rows = await sql`
      SELECT id, username, password_hash, role
      FROM app_user
      WHERE username = ${username}
    `;

    if (rows.length === 0) return null;

    const user = rows[0];

    // Verify password (supports both bcrypt hashed and plain text for backward compatibility)
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) return null;

    const sessionUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const cookieStore = await cookies();
    cookieStore.set("quadbase_session", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return sessionUser;
  } catch (err) {
    console.error("Database error during login:", err);
    throw err;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("quadbase_session");
}
