import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

console.log("[DB] Starting connection...");
console.log("[DB] URL prefix:", connectionString?.split('@')[1]?.split('/')[0]);

// For Supabase on Vercel, use connection pooler with no SSL
const client = postgres(connectionString, {
  prepare: false,
  ssl: false,  // Try without SSL for Supabase
  max: 10,
  connect_timeout: 30,
});

console.log("[DB] Postgres client configured");

export const db = drizzle(client, { schema });

console.log("[DB] Drizzle initialized");