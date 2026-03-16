import { NextRequest, NextResponse } from "next/server";

let auth: any;
let initError: any = null;

try {
  const authModule = require("@/lib/auth");
  auth = authModule.auth;
} catch (e: any) {
  initError = e;
}

export async function POST(req: NextRequest) {
  if (initError) {
    return NextResponse.json({ 
      error: "Auth init failed", 
      message: initError?.message
    }, { status: 500 });
  }
  
  try {
    console.log("[Auth] Calling handler...");
    const response = await auth.handler(req);
    console.log("[Auth] Handler returned:", response);
    
    if (!response) {
      return NextResponse.json({ 
        error: "Handler returned empty response"
      }, { status: 500 });
    }
    
    return response;
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Auth handler error", 
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
}