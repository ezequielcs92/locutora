import { NextResponse } from "next/server";
import {
  adminCookieName,
  createAdminToken,
  getAdminEmail,
  validateAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.json(
      { ok: false, error: "Email o contraseña incorrectos." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, createAdminToken(getAdminEmail()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
