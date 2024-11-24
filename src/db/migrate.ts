import { promises as fs } from "fs";
import path from "path";
import postgres from "postgres";

const DATABASE_URL =
  "postgresql://nextstarter:supersecret@localhost:5432/nextstarter";

async function migrate() {
  const migrationClient = postgres(DATABASE_URL, { ssl: false });

  try {
    // Read and execute the migration file
    const migrationPath = path.join(
      process.cwd(),
      "src",
      "db",
      "migrations",
      "0005_create_tables.sql"
    );
    const sql = await fs.readFile(migrationPath, "utf-8");

    console.log("Executing migration...");
    await migrationClient.unsafe(sql);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

migrate().catch(console.error);
