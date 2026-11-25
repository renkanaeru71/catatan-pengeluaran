import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect everything except Next internals, static assets and the login page.
    "/((?!_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
