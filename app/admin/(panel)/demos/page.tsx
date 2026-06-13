import DemosManager, { type AdminDemo } from "@/components/admin/DemosManager";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export const metadata = { title: "Demos — Admin" };

export default async function AdminDemosPage() {
  const supabase = await createClient();

  const [demosRes, categoriesRes] = await Promise.all([
    supabase
      .from("demos")
      .select("*, category:categories(id, name)")
      .order("sort_order", { ascending: true }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
  ]);

  const demos = (demosRes.data ?? []) as unknown as AdminDemo[];
  const categories = (categoriesRes.data ?? []) as Category[];

  return <DemosManager demos={demos} categories={categories} />;
}
