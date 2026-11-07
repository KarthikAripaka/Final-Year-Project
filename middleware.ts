import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDevMode = process.env.DEV_MODE === "true";

  // Allow static assets, api routes that don't need auth, and auth pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/manifest") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // In DEV_MODE fallback, we allow full seamless navigation for demoing
  if (isDevMode) {
    return NextResponse.next();
  }

  // Read auth token cookie (standard Supabase auth token pattern or campus session cookie)
  const cookies = request.cookies.getAll();
  const hasToken = cookies.some(
    (c) =>
      c.name.includes("auth-token") ||
      c.name.includes("access-token") ||
      c.name === "campus_session" ||
      c.name === "campus_role"
  );

  if (!hasToken && (pathname.startsWith("/student") || pathname.startsWith("/admin") || pathname.startsWith("/faculty"))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/faculty/:path*", "/login", "/register"],
};
