import postgres from "postgres";

const DATABASE_URL =
  "postgresql://nextstarter:supersecret@localhost:5432/nextstarter";

// Create a separate client for migration to avoid conflicts
const migrationClient = postgres(DATABASE_URL, { ssl: false });

// Add hashed_password column if it doesn't exist
async function migrate() {
  try {
    await migrationClient.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hashed_password" text;
    `);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

migrate().catch(console.error);
