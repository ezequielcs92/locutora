import { isSupabaseConfigured } from "./env";
import { mockCategories, mockDemos, mockVideos } from "./mock-data";
import { publicUrl } from "./r2";
import { createPublicClient } from "./supabase/public";
import type { PublicCategory, PublicDemo, PublicVideo } from "./types";

/**
 * Capa de datos del sitio público. Si Supabase no está configurado,
 * devuelve datos de muestra para poder desarrollar/previsualizar sin credenciales.
 */

export async function getPublicCategories(): Promise<PublicCategory[]> {
  if (!isSupabaseConfigured()) return mockCategories;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error al traer categorías:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublicDemos(): Promise<PublicDemo[]> {
  if (!isSupabaseConfigured()) return mockDemos;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("demos")
    .select(
      "id, slug, title, description, duration_seconds, r2_key, category:categories(id, name)"
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error al traer demos:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const category = Array.isArray(row.category) ? row.category[0] : row.category;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      categoryId: category?.id ?? null,
      categoryName: category?.name ?? null,
      durationSeconds: row.duration_seconds,
      audioUrl: publicUrl(row.r2_key),
    };
  });
}

export async function getPublicVideos(): Promise<PublicVideo[]> {
  if (!isSupabaseConfigured()) return mockVideos;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, description, platform, video_id")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error al traer videos:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    platform: row.platform as "youtube" | "vimeo",
    videoId: row.video_id,
  }));
}
