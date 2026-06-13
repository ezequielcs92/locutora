import type { PublicCategory, PublicDemo, PublicVideo } from "./types";

/**
 * Datos de muestra para correr el sitio sin Supabase/R2 configurados.
 * Los audios viven en public/demos/ (generados con `npm run gen:audio`).
 */

export const mockCategories: PublicCategory[] = [
  { id: "cat-comercial", name: "Comercial", slug: "comercial" },
  { id: "cat-institucional", name: "Institucional", slug: "institucional" },
  { id: "cat-ivr", name: "IVR", slug: "ivr" },
  { id: "cat-elearning", name: "E-learning", slug: "e-learning" },
  { id: "cat-doblaje", name: "Doblaje", slug: "doblaje" },
];

export const mockDemos: PublicDemo[] = [
  {
    id: "demo-1",
    slug: "spot-radial-bebida",
    title: "Spot radial — Bebida",
    description: "Spot de 30 segundos para radio, tono enérgico.",
    categoryId: "cat-comercial",
    categoryName: "Comercial",
    durationSeconds: 12,
    audioUrl: "/demos/demo-comercial-1.wav",
  },
  {
    id: "demo-2",
    slug: "tv-lanzamiento-producto",
    title: "TV — Lanzamiento de producto",
    description: "Locución para TV, registro cálido y cercano.",
    categoryId: "cat-comercial",
    categoryName: "Comercial",
    durationSeconds: 12,
    audioUrl: "/demos/demo-comercial-2.wav",
  },
  {
    id: "demo-3",
    slug: "institucional-banco",
    title: "Video institucional — Banco",
    description: "Narración corporativa, tono confiable.",
    categoryId: "cat-institucional",
    categoryName: "Institucional",
    durationSeconds: 12,
    audioUrl: "/demos/demo-institucional.wav",
  },
  {
    id: "demo-4",
    slug: "ivr-clinica",
    title: "Central telefónica — Clínica",
    description: "Menú IVR con opciones, dicción clara.",
    categoryId: "cat-ivr",
    categoryName: "IVR",
    durationSeconds: 12,
    audioUrl: "/demos/demo-ivr.wav",
  },
  {
    id: "demo-5",
    slug: "elearning-seguridad",
    title: "Curso online — Seguridad",
    description: "Módulo e-learning, ritmo pausado y didáctico.",
    categoryId: "cat-elearning",
    categoryName: "E-learning",
    durationSeconds: 12,
    audioUrl: "/demos/demo-elearning.wav",
  },
  {
    id: "demo-6",
    slug: "doblaje-documental",
    title: "Documental — Naturaleza",
    description: "Doblaje de documental, registro narrativo.",
    categoryId: "cat-doblaje",
    categoryName: "Doblaje",
    durationSeconds: 12,
    audioUrl: "/demos/demo-doblaje.wav",
  },
];

export const mockVideos: PublicVideo[] = [
  {
    id: "video-1",
    title: "Reel de locución 2026",
    description: "Compilado de trabajos recientes.",
    platform: "youtube",
    videoId: "M7lc1UVf-VE",
  },
  {
    id: "video-2",
    title: "Campaña — Marca de gaseosas",
    description: "Spot televisivo nacional.",
    platform: "youtube",
    videoId: "ysz5S6PUM-U",
  },
  {
    id: "video-3",
    title: "Institucional — Universidad",
    description: "Video institucional con voz en off.",
    platform: "youtube",
    videoId: "aqz-KE-bpKQ",
  },
  {
    id: "video-4",
    title: "Documental — Patagonia",
    description: "Fragmento de narración documental.",
    platform: "vimeo",
    videoId: "76979871",
  },
];
