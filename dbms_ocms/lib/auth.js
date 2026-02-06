import { cookies } from "next/headers";
import { sql } from "./db";

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
  const rows = await sql`
    SELECT id, username, password_hash, role
    FROM app_user
    WHERE username = ${username}
  `;

  if (rows.length === 0) return null;

  const user = rows[0];

  // For demo purposes, password is stored as plain text
  if (user.password_hash !== password) return null;

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
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("quadbase_session");
}
