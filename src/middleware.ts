import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { PublicApiRoutes, PublicPaths } from "@/config/auth";
import { authConfig } from "@/config/auth";

function isPublicPath(pathname: string): pathname is PublicPaths {
  return authConfig.publicPaths.some(
    (path) => pathname.startsWith(path) || pathname === path
  );
}

function isPublicApiRoute(pathname: string): pathname is PublicApiRoutes {
  return authConfig.publicApiRoutes.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and API routes
  if (isPublicPath(pathname) || isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const hasAuthCookie = request.cookies.has(authConfig.cookieName);

  // If no auth cookie and not a public route, redirect to signin
  if (!hasAuthCookie) {
    const signInUrl = new URL(authConfig.pages.signIn, request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
