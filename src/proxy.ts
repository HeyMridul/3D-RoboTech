import { NextResponse, type NextRequest } from "next/server";

/**
 * First-pass gate for the CMS.
 *
 * This is an optimistic check on cookie presence only — it keeps anonymous
 * traffic off the admin surface cheaply. It is deliberately not the
 * authorization boundary: every admin page calls `auth()` and every admin
 * route handler calls `requireAuth()`, which verify the session and role
 * against the database. See the Next.js proxy guidance on optimistic checks.
 */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page must stay reachable without a session.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIES.some((name) =>
    request.cookies.has(name),
  );

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Preserve where they were heading so login can return them there.
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
