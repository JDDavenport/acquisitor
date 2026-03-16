import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error: any) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ 
      error: "Auth error", 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error: any) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ 
      error: "Auth error", 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}