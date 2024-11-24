import { promises as fs } from "fs";
import path from "path";
import postgres from "postgres";

const DATABASE_URL =
  "postgresql://nextstarter:supersecret@localhost:5432/nextstarter";

async function migrate() {
  const migrationClient = postgres(DATABASE_URL, { ssl: false });

  try {
    // Read and execute migration 0004 first
    const migration004Path = path.join(
      process.cwd(),
      "src",
      "db",
      "migrations",
      "0004_fix_user_table.sql"
    );
    const sql004 = await fs.readFile(migration004Path, "utf-8");

    console.log("Executing migration 0004...");
    await migrationClient.unsafe(sql004);
    console.log("Migration 0004 completed successfully");

    // Then read and execute migration 0005
    const migration005Path = path.join(
      process.cwd(),
      "src",
      "db",
      "migrations",
      "0005_create_tables.sql"
    );
    const sql005 = await fs.readFile(migration005Path, "utf-8");

    console.log("Executing migration 0005...");
    await migrationClient.unsafe(sql005);
    console.log("Migration 0005 completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

migrate().catch(console.error);
