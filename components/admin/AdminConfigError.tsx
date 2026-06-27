export default function AdminConfigError({ message }: { message: string }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-accent/30 bg-surface p-6 text-sm leading-relaxed text-muted">
      <h1 className="font-display text-2xl font-medium text-cream">Falta configurar el admin</h1>
      <p className="mt-3">{message}</p>
      <p className="mt-4">
        Copiá la <code className="text-accent">service_role key</code> desde Supabase en
        <code className="text-accent"> Project Settings → API</code> y agregala en
        <code className="text-accent"> .env.local</code> como
        <code className="text-accent"> SUPABASE_SERVICE_ROLE_KEY</code>.
      </p>
      <p className="mt-4 text-xs text-muted/80">
        Es una clave secreta: no la subas al repositorio ni la uses del lado del navegador.
      </p>
    </div>
  );
}
