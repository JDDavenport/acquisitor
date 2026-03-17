import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  if (req.url.includes('/health')) {
    try {
      const pg = await import("pg");
      const pool = new pg.default.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 5000,
      });
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();
      return NextResponse.json({ status: 'ok', db: 'connected' });
    } catch (e: any) {
      return NextResponse.json({ status: 'ok', db: 'error', error: e.message });
    }
  }
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  return handlers.POST(req);
}
