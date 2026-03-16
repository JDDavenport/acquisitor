import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const handlers = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  // Health check
  if (req.url.includes('/health')) {
    // Test database connection
    let dbStatus = 'unknown';
    try {
      await db.execute(sql`SELECT 1`);
      dbStatus = 'connected';
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }
    
    return NextResponse.json({ 
      status: 'ok',
      database: !!process.env.DATABASE_URL,
      dbConnection: dbStatus,
      secret: !!process.env.BETTER_AUTH_SECRET,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL
    });
  }
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  return handlers.POST(req);
}