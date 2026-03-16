import { NextRequest, NextResponse } from "next/server";

const auth = require("@/lib/auth").auth;

export async function POST(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    
    // Check what type of response we got
    if (response instanceof Response) {
      const body = await response.text();
      return NextResponse.json({ 
        responseType: "Response",
        status: response.status,
        body: body || "(empty)"
      });
    }
    
    if (response instanceof NextResponse) {
      return NextResponse.json({ 
        responseType: "NextResponse",
        response: "NextResponse object"
      });
    }
    
    return NextResponse.json({ 
      responseType: typeof response,
      response: response || "(null/undefined)"
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error?.message || String(error)
    }, { status: 500 });
  }
}