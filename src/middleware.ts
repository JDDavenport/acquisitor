import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication  
const protectedRoutes = ["/dashboard", "/leads", "/deals", "/activities", "/settings"];
const authRoutes = ["/login", "/signup"];
const publicRoutes = ["/demo"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a public route (like /demo)
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Skip middleware for public pages
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (Better Auth uses __Secure- prefix on HTTPS)
  const sessionCookie = request.cookies.get("acquisitor.session_token") 
    || request.cookies.get("__Secure-acquisitor.session_token");
  const hasSession = !!sessionCookie?.value;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
