import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log("Ensuring 'approved' column exists on enroll table...");
    await sql`
      ALTER TABLE enroll
      ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE
    `;
    console.log("Migration complete: 'approved' column ensured.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
