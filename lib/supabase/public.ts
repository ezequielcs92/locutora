import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo sin cookies, para lecturas públicas en Server Components
 * (la home no necesita sesión y así puede cachearse con revalidate).
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
