import VideosManager from "@/components/admin/VideosManager";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";

export const metadata = { title: "Videos — Admin" };

export default async function AdminVideosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true });

  return <VideosManager videos={(data ?? []) as Video[]} />;
}
