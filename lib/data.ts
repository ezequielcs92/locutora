import { isSupabaseConfigured } from "./env";
import { publicUrl } from "./r2";
import { createPublicClient } from "./supabase/public";
import type { PublicCategory, PublicDemo, PublicVideo } from "./types";
import { videoCollectionConfig, type VideoCollection } from "./video-collections";

/**
 * Capa de datos del sitio público. Sin Supabase o ante un error de
 * conexión devuelve listas vacías: las secciones saben renderizar el
 * estado vacío y se prefiere no mostrar contenido de muestra.
 */

function warn(message: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(message);
  }
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  if (!isSupabaseConfigured()) {
    warn("Supabase no configurado, devolviendo categorías vacías");
    return [];
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true });

    if (error) {
      warn(`Supabase no disponible, devolviendo categorías vacías: ${error.message}`);
      return [];
    }
    return data ?? [];
  } catch {
    warn("Error de conexión a Supabase, devolviendo categorías vacías");
    return [];
  }
}

export async function getPublicDemos(): Promise<PublicDemo[]> {
  if (!isSupabaseConfigured()) {
    warn("Supabase no configurado, devolviendo demos vacíos");
    return [];
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("demos")
      .select(
        "id, slug, title, description, duration_seconds, r2_key, category:categories(id, name)"
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      warn(`Supabase no disponible, devolviendo demos vacíos: ${error.message}`);
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
  } catch {
    warn("Error de conexión a Supabase, devolviendo demos vacíos");
    return [];
  }
}

export async function getPublicVideos(): Promise<PublicVideo[]> {
  return getPublicVideoCollection("videos");
}

export async function getPublicWorks(): Promise<PublicVideo[]> {
  return getPublicVideoCollection("works");
}

async function getPublicVideoCollection(collection: VideoCollection): Promise<PublicVideo[]> {
  if (!isSupabaseConfigured()) {
    warn("Supabase no configurado, devolviendo videos vacíos");
    return [];
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from(videoCollectionConfig(collection).table)
      .select("id, title, description, platform, video_id")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      warn(`Supabase no disponible, devolviendo videos vacíos: ${error.message}`);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      platform: row.platform as "youtube" | "vimeo",
      videoId: row.video_id,
    }));
  } catch {
    warn("Error de conexión a Supabase, devolviendo videos vacíos");
    return [];
  }
}
