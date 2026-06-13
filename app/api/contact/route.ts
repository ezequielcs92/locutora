import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isResendConfigured } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwardedFor ??
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  if (attempts.size > 500) {
    for (const [attemptKey, attempt] of attempts) {
      if (attempt.resetAt <= now) attempts.delete(attemptKey);
    }
  }

  return current.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  if (company) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Completá todos los campos." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "El email no parece válido." },
      { status: 400 }
    );
  }
  if (name.length > 120 || email.length > 200 || message.length > 3000) {
    return NextResponse.json(
      { ok: false, error: "El mensaje es demasiado largo." },
      { status: 400 }
    );
  }
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { ok: false, error: "Recibí muchos mensajes seguidos. Probá de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "El formulario todavía no está configurado. Escribime por WhatsApp o email.",
      },
      { status: 503 }
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const { error } = await resend.emails.send({
      from: `${siteConfig.name} <${fromEmail}>`,
      to: process.env.CONTACT_EMAIL_TO!,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} desde el sitio`,
      text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return NextResponse.json(
        { ok: false, error: "No se pudo enviar el mensaje. Probá de nuevo en unos minutos." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al enviar el mail:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo enviar el mensaje. Probá de nuevo en unos minutos." },
      { status: 500 }
    );
  }
}
