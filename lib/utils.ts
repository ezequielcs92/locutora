/** Formatea segundos como m:ss. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "–:––";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Genera un slug URL-safe desde un título (maneja acentos del español). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export interface ParsedVideoUrl {
  platform: "youtube" | "vimeo";
  videoId: string;
}

/** Extrae plataforma + ID desde una URL de YouTube o Vimeo. */
export function parseVideoUrl(url: string): ParsedVideoUrl | null {
  const trimmed = url.trim();

  const youtube = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  if (youtube) return { platform: "youtube", videoId: youtube[1] };

  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { platform: "vimeo", videoId: vimeo[1] };

  return null;
}

/** URL de thumbnail estática (sin iframe) para el grid de videos. */
export function videoThumbnailUrl(platform: "youtube" | "vimeo", videoId: string): string {
  return platform === "youtube"
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://vumbnail.com/${videoId}.jpg`;
}

/** URL de embed para el lightbox, con autoplay. */
export function videoEmbedUrl(platform: "youtube" | "vimeo", videoId: string): string {
  return platform === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    : `https://player.vimeo.com/video/${videoId}?autoplay=1`;
}

/** Formatea bytes legibles. */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
