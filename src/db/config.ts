import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";

import * as schema from "./schema";

// Create a new postgres client for queries
const client = postgres(env.DATABASE_URL, { ssl: false });

// Create a drizzle database instance
export const db = drizzle(client, { schema });
