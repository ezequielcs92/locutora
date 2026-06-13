import { NextResponse } from "next/server";
import { isR2Configured } from "@/lib/env";
import { createUploadUrl } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "audio/webm",
]);

/** Genera una presigned URL para subir un audio directo del browser a R2. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Cloudflare R2 no está configurado (revisá las variables de entorno)." },
      { status: 503 }
    );
  }

  let body: { fileName?: unknown; contentType?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const fileName = typeof body.fileName === "string" ? body.fileName : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Formato no soportado. Subí un archivo de audio (MP3 recomendado)." },
      { status: 400 }
    );
  }

  const ext = (fileName.split(".").pop() ?? "mp3").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
  const key = `demos/${crypto.randomUUID()}.${ext}`;

  try {
    const uploadUrl = await createUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    console.error("Error generando presigned URL:", err);
    return NextResponse.json(
      { error: "No se pudo generar la URL de subida." },
      { status: 500 }
    );
  }
}
