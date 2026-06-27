"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, getAdminSession } from "@/lib/admin-auth";
import { isR2Configured } from "@/lib/env";
import { deleteObject } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAuth() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado.");
  return createAdminClient();
}

async function cleanupUploadedAudio(key: string) {
  if (!key || !isR2Configured()) return;
  try {
    await deleteObject(key);
  } catch (r2Error) {
    console.error("No se pudo borrar el audio subido tras fallar la operación:", r2Error);
  }
}

function fail(error: unknown, fallback: string): ActionResult {
  console.error(fallback, error);
  const message = error instanceof Error ? error.message : fallback;
  return { ok: false, error: message };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
  redirect("/admin/login");
}

/* ===================== Demos ===================== */

export interface DemoInput {
  title: string;
  description: string | null;
  categoryId: string | null;
  isPublished: boolean;
}

export async function createDemo(
  input: DemoInput & { r2Key: string; durationSeconds: number | null; fileSize: number | null }
): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    if (!input.title.trim()) {
      await cleanupUploadedAudio(input.r2Key);
      return { ok: false, error: "El título es obligatorio." };
    }
    if (!input.r2Key.trim()) return { ok: false, error: "Falta el archivo de audio." };

    const { count } = await supabase
      .from("demos")
      .select("id", { count: "exact", head: true });

    const baseSlug = slugify(input.title) || "demo";
    let slug = baseSlug;

    for (let attempt = 0; attempt < 2; attempt++) {
      const { error } = await supabase.from("demos").insert({
        title: input.title.trim(),
        slug,
        description: input.description?.trim() || null,
        category_id: input.categoryId,
        r2_key: input.r2Key,
        duration_seconds: input.durationSeconds,
        file_size: input.fileSize,
        sort_order: count ?? 0,
        is_published: input.isPublished,
      });

      if (!error) {
        revalidatePath("/");
        revalidatePath("/admin/demos");
        return { ok: true };
      }
      // Slug duplicado: reintentar con sufijo aleatorio
      if (error.code === "23505") {
        slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      await cleanupUploadedAudio(input.r2Key);
      return { ok: false, error: error.message };
    }
    await cleanupUploadedAudio(input.r2Key);
    return { ok: false, error: "No se pudo generar un slug único." };
  } catch (err) {
    return fail(err, "No se pudo crear el demo.");
  }
}

export async function updateDemo(id: string, input: DemoInput): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    if (!input.title.trim()) return { ok: false, error: "El título es obligatorio." };
    const { error } = await supabase
      .from("demos")
      .update({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category_id: input.categoryId,
        is_published: input.isPublished,
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/demos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo actualizar el demo.");
  }
}

export async function toggleDemoPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase
      .from("demos")
      .update({ is_published: isPublished })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/demos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo cambiar la publicación.");
  }
}

export async function deleteDemo(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();

    const { data: demo, error: fetchError } = await supabase
      .from("demos")
      .select("r2_key")
      .eq("id", id)
      .single();
    if (fetchError) return { ok: false, error: fetchError.message };

    const { error } = await supabase.from("demos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    // Borrar también el archivo en R2 (best effort: la fila ya se eliminó)
    if (demo?.r2_key && isR2Configured()) {
      try {
        await deleteObject(demo.r2_key);
      } catch (r2Error) {
        console.error("La fila se borró pero falló el borrado en R2:", r2Error);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/demos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo eliminar el demo.");
  }
}

export async function reorderDemos(orderedIds: string[]): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from("demos")
        .update({ sort_order: i })
        .eq("id", orderedIds[i]);
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath("/");
    revalidatePath("/admin/demos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo reordenar.");
  }
}

/* ===================== Videos ===================== */

export interface VideoInput {
  title: string;
  description: string | null;
  platform: "youtube" | "vimeo";
  videoId: string;
  isPublished: boolean;
}

export async function createVideo(input: VideoInput): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    if (!input.title.trim()) return { ok: false, error: "El título es obligatorio." };
    if (!input.videoId.trim()) return { ok: false, error: "Pegá una URL válida de video." };
    if (input.platform !== "youtube" && input.platform !== "vimeo") {
      return { ok: false, error: "La plataforma del video no es válida." };
    }

    const { count } = await supabase
      .from("videos")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase.from("videos").insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      platform: input.platform,
      video_id: input.videoId,
      sort_order: count ?? 0,
      is_published: input.isPublished,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/videos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo crear el video.");
  }
}

export async function updateVideo(id: string, input: VideoInput): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    if (!input.title.trim()) return { ok: false, error: "El título es obligatorio." };
    if (!input.videoId.trim()) return { ok: false, error: "Pegá una URL válida de video." };
    if (input.platform !== "youtube" && input.platform !== "vimeo") {
      return { ok: false, error: "La plataforma del video no es válida." };
    }
    const { error } = await supabase
      .from("videos")
      .update({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        platform: input.platform,
        video_id: input.videoId,
        is_published: input.isPublished,
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/videos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo actualizar el video.");
  }
}

export async function toggleVideoPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase
      .from("videos")
      .update({ is_published: isPublished })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/videos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo cambiar la publicación.");
  }
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/videos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo eliminar el video.");
  }
}

export async function reorderVideos(orderedIds: string[]): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from("videos")
        .update({ sort_order: i })
        .eq("id", orderedIds[i]);
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath("/");
    revalidatePath("/admin/videos");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo reordenar.");
  }
}

/* ===================== Categorías ===================== */

export async function createCategory(name: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "El nombre es obligatorio." };

    const { count } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase.from("categories").insert({
      name: trimmed,
      slug: slugify(trimmed) || `categoria-${Date.now()}`,
      sort_order: count ?? 0,
    });
    if (error) {
      if (error.code === "23505") return { ok: false, error: "Ya existe una categoría con ese nombre." };
      return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/categorias");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo crear la categoría.");
  }
}

export async function renameCategory(id: string, name: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "El nombre es obligatorio." };

    const { error } = await supabase
      .from("categories")
      .update({ name: trimmed })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/categorias");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo renombrar la categoría.");
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/categorias");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo eliminar la categoría.");
  }
}

export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  try {
    const supabase = await requireAuth();
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from("categories")
        .update({ sort_order: i })
        .eq("id", orderedIds[i]);
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath("/");
    revalidatePath("/admin/categorias");
    return { ok: true };
  } catch (err) {
    return fail(err, "No se pudo reordenar.");
  }
}
