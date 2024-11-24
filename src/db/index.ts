import { db as dbClient } from "./config";

// Export schema types
export * from "./schema";

// Export the database client directly
export const db = dbClient;

// Export async database actions for server components
export async function query() {
  return {
    users: db.query.users,
    accounts: db.query.accounts,
    sessions: db.query.sessions,
    guestbookEntries: db.query.guestbookEntries,
    userContent: db.query.userContent,
  };
}
