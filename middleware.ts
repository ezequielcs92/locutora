import { NextResponse, type NextRequest } from "next/server";

const adminCookieName = "locutora_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retirar este bloque para volver a habilitar el sitio público.
  if (pathname === "/") {
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // Protege todo /admin: sin cookie de sesión → /admin/login.
  const isLoginPage = pathname.startsWith("/admin/login");

  if (isLoginPage) return NextResponse.next();

  if (!request.cookies.get(adminCookieName)?.value) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
