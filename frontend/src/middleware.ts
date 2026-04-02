import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME?.trim() || "auth_token";

export function middleware(request: NextRequest) {
  if (!request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
