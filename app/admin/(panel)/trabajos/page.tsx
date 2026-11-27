import AdminConfigError from "@/components/admin/AdminConfigError";
import VideosManager from "@/components/admin/VideosManager";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Video } from "@/lib/types";

export const metadata = { title: "Trabajos — Admin" };

export default async function AdminWorksPage() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return (
        <AdminConfigError showCredentialsHelp={false} message="No se pudieron cargar los trabajos. Verificá la conexión y que se haya ejecutado la migración 0003_works.sql en Supabase." />
      );
    }

    return <VideosManager collection="works" videos={(data ?? []) as Video[]} />;
  } catch (error) {
    return <AdminConfigError message={error instanceof Error ? error.message : "No se pudo configurar Supabase."} />;
  }
}
