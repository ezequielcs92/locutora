import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const adminCookieName = "locutora_admin_session";

const defaultAdminEmail = "admin@locutora.com";
const sessionDurationMs = 1000 * 60 * 60 * 8;

interface AdminSessionPayload {
  email: string;
  exp: number;
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL ?? defaultAdminEmail;
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getAdminSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "locutora-dev-secret"
  );
}

function sign(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function validateAdminCredentials(email: string, password: string) {
  const adminPassword = getAdminPassword();
  if (!adminPassword) return false;

  return (
    safeEqual(email.trim().toLowerCase(), getAdminEmail().toLowerCase()) &&
    safeEqual(password.trim(), adminPassword)
  );
}

export function createAdminToken(email: string) {
  const payload: AdminSessionPayload = {
    email,
    exp: Date.now() + sessionDurationMs,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminToken(token?: string): AdminSessionPayload | null {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as AdminSessionPayload;
    if (!payload.email || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(adminCookieName)?.value);
}
