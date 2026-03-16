import { NextRequest, NextResponse } from "next/server";

let auth: any;
let authError: any;

try {
  const authModule = require("@/lib/auth");
  auth = authModule.auth;
} catch (e: any) {
  authError = e;
}

export async function GET(req: NextRequest) {
  if (authError) {
    return NextResponse.json({ 
      error: "Auth initialization failed", 
      message: authError?.message || String(authError),
      stack: authError?.stack
    }, { status: 500 });
  }
  
  try {
    return await auth.handler(req);
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Auth GET error", 
      message: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (authError) {
    return NextResponse.json({ 
      error: "Auth initialization failed", 
      message: authError?.message || String(authError),
      stack: authError?.stack
    }, { status: 500 });
  }
  
  try {
    return await auth.handler(req);
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Auth POST error", 
      message: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
}