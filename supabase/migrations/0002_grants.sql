-- Migración 0002: grants de lectura pública.
-- Correr en el SQL Editor de Supabase, después de 0001_init.sql.
--
-- Las policies de RLS por sí solas no alcanzan: sin GRANT, PostgREST
-- responde 404 (tabla fuera del schema cache) para el rol anon y el
-- sitio público no puede leer. Idempotente: se puede correr aunque los
-- grants ya existan (p. ej. dados a mano por dashboard).

grant select on public.categories to anon, authenticated;
grant select on public.demos to anon, authenticated;
grant select on public.videos to anon, authenticated;
