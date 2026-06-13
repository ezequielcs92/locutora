"use client";

import { createClient } from "@/lib/supabase/client";

/** Configuración pública de Supabase disponible en el browser. */
export function isSupabasePublicConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Incrementa play_count vía RPC, una sola vez por demo por sesión de navegación.
 */
export function registerPlay(demoId: string) {
  try {
    const key = `played:${demoId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const supabase = createClient();
    void supabase.rpc("increment_play_count", { demo_id: demoId }).then(({ error }) => {
      if (error) console.error("No se pudo registrar la reproducción:", error.message);
    });
  } catch {
    // sessionStorage puede no estar disponible (modo privado estricto): ignorar
  }
}
