import { NextRequest, NextResponse } from "next/server";

let auth: any;
let initError: any = null;

try {
  const authModule = require("@/lib/auth");
  auth = authModule.auth;
} catch (e: any) {
  initError = e;
}

export async function GET(req: NextRequest) {
  if (initError) {
    return NextResponse.json({ 
      error: "Auth init failed", 
      message: initError?.message,
      stack: initError?.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
  
  try {
    return await auth.handler(req);
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Auth handler error", 
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (initError) {
    return NextResponse.json({ 
      error: "Auth init failed", 
      message: initError?.message,
      stack: initError?.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
  
  try {
    return await auth.handler(req);
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Auth handler error", 
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
}