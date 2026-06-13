import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Thumbnails de videos (sin iframes en el grid)
  { protocol: "https", hostname: "img.youtube.com" },
  { protocol: "https", hostname: "i.ytimg.com" },
  { protocol: "https", hostname: "vumbnail.com" },
];

// Permitir imágenes servidas desde el bucket público de R2, si está configurado
if (process.env.R2_PUBLIC_URL) {
  try {
    const { hostname } = new URL(process.env.R2_PUBLIC_URL);
    remotePatterns.push({ protocol: "https", hostname });
  } catch {
    // URL inválida: se ignora
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
