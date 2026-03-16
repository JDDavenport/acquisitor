import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

console.log("[DB] Using node-postgres (pg)");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err);
});

console.log("[DB] Pool created");

export const db = drizzle(pool, { schema });

console.log("[DB] Drizzle initialized");