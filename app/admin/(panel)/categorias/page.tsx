import AdminConfigError from "@/components/admin/AdminConfigError";
import CategoriesManager, { type AdminCategory } from "@/components/admin/CategoriesManager";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Categorías — Admin" };

export default async function AdminCategoriasPage() {
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
    .from("categories")
    .select("*, demos(count)")
    .order("sort_order", { ascending: true });

  const categories: AdminCategory[] = (data ?? []).map((row) => {
    const { demos, ...category } = row as typeof row & { demos: { count: number }[] };
    return { ...category, demoCount: demos?.[0]?.count ?? 0 };
  });

  return <CategoriesManager categories={categories} />;
}
