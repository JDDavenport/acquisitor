import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function GET(req: NextRequest) {
  try {
    return await auth.handler(req);
  } catch (error: any) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ 
      error: "Auth error", 
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await auth.handler(req);
  } catch (error: any) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ 
      error: "Auth error", 
      message: error.message 
    }, { status: 500 });
  }
}