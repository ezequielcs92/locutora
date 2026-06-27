import { NextResponse, type NextRequest } from "next/server";

const adminCookieName = "locutora_admin_session";

/** Protege todo /admin: sin cookie de sesión → /admin/login. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.startsWith("/admin/login");

  if (isLoginPage) return NextResponse.next();

  if (!request.cookies.get(adminCookieName)?.value) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
