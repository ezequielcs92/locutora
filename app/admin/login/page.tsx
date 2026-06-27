"use client";

import { Loader2, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const adminEmail = "admin@locutora.com";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setLoading(false);
      setError(data.error ?? "No se pudo iniciar sesión.");
      return;
    }

    router.replace("/admin/demos");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Mic size={26} />
          </span>
          <h1 className="font-display text-2xl font-medium text-cream">Panel de administración</h1>
          <p className="text-sm text-muted">Ingresá con el usuario administrador</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-cream/10 bg-surface p-6"
        >
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted">Email</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={adminEmail}
                autoComplete="email"
                className="rounded-xl border border-cream/10 bg-bg px-4 py-3 text-cream focus:border-accent/60 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted">Contraseña</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Contraseña del administrador"
                className="rounded-xl border border-cream/10 bg-bg px-4 py-3 text-cream focus:border-accent/60 focus:outline-none"
              />
            </label>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-bg transition-colors hover:bg-accent-strong disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
        </form>
      </div>
    </main>
  );
}
