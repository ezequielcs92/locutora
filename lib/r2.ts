import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const LOCAL_PLACEHOLDER_AUDIO: Record<string, string> = {
  "demos/placeholder-1.mp3": "/demos/demo-comercial-1.wav",
  "demos/placeholder-2.mp3": "/demos/demo-comercial-2.wav",
  "demos/placeholder-3.mp3": "/demos/demo-institucional.wav",
  "demos/placeholder-4.mp3": "/demos/demo-ivr.wav",
  "demos/placeholder-5.mp3": "/demos/demo-elearning.wav",
  "demos/placeholder-6.mp3": "/demos/demo-doblaje.wav",
};

/** Cliente S3 apuntando a Cloudflare R2. Solo usar del lado del servidor. */
function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/** Genera una presigned URL para subir un archivo directo del browser a R2. */
export async function createUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client(), command, { expiresIn: 60 * 10 });
}

/** Borra un objeto de R2 (al eliminar un demo). */
export async function deleteObject(key: string) {
  await r2Client().send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

/** URL pública de un objeto de R2. */
export function publicUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
  if (!base) return LOCAL_PLACEHOLDER_AUDIO[cleanKey] ?? `/${cleanKey}`;
  return `${base}/${cleanKey}`;
}
