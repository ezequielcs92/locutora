import AdminConfigError from "@/components/admin/AdminConfigError";
import VideosManager from "@/components/admin/VideosManager";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Video } from "@/lib/types";

export const metadata = { title: "Videos — Admin" };

export default async function AdminVideosPage() {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    return (
      <AdminConfigError
        message={error instanceof Error ? error.message : "No se pudo configurar Supabase."}
      />
    );
  }
  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true });

  return <VideosManager videos={(data ?? []) as Video[]} />;
}
