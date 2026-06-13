import CategoriesManager, { type AdminCategory } from "@/components/admin/CategoriesManager";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Categorías — Admin" };

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
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
