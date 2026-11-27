# Sitio One Page — Locutora

Portfolio one-page para una locutora profesional con demos de audio filtrables, videos embebidos, animaciones y dashboard de administración autogestionable. Deploy en Vercel.

## Stack

- **Next.js 15** (App Router) + TypeScript estricto
- **Tailwind CSS v4** (tokens definidos con `@theme` en `app/globals.css`, no hay `tailwind.config`)
- **Motion** (`motion/react`) para todas las animaciones — NO instalar GSAP ni otras librerías de animación
- **Lenis** (`lenis/react`) para smooth scroll — solo en el layout público, NUNCA en `/admin`
- **Wavesurfer.js v7** para waveforms interactivos
- **Zustand** para el estado del player global (`store/player.ts`)
- **Supabase** (Postgres + Auth) — clientes en `lib/supabase/`
- **Cloudflare R2** para storage de audios (presigned URLs, `lib/r2.ts`)
- **Resend** para el formulario de contacto
- **dnd-kit** para reordenamiento en el admin
- **lucide-react** para íconos

## Convenciones

- Componentes en `/components` con subcarpetas: `ui/`, `sections/`, `admin/`, `player/`, `videos/`, `layout/`, `providers/`
- **Server Components por defecto**; `"use client"` solo donde haga falta (interactividad, hooks, Motion)
- Route Handlers en `/app/api`; **server actions** (`app/admin/actions.ts`) para mutaciones del admin
- **Todo texto visible al usuario en español (Argentina)** — voseo: "Escuchá", "Conocé"
- Mobile-first: el sitio debe verse perfecto en 375px
- Respetar `prefers-reduced-motion` en todas las animaciones
- Textos, contacto y datos de la clienta centralizados en `lib/site-config.ts`

## Sin credenciales

Si `NEXT_PUBLIC_SUPABASE_URL` no está definida o Supabase no responde, `lib/data.ts`
devuelve listas vacías y las secciones muestran su estado vacío (no hay contenido
de muestra en el sitio público). El admin sí requiere Supabase real.

## Base de datos

- Migraciones en `supabase/migrations/` (correr en el SQL Editor de Supabase, en orden)
- Seed en `supabase/seed.sql`
- RLS: lectura pública solo de `is_published = true`; escritura solo `authenticated`
- Grants: `0002_grants.sql` da `select` a `anon, authenticated` (sin GRANT, PostgREST
  responde 404 aunque existan las policies)
- `play_count` se incrementa vía RPC `increment_play_count(demo_id)` (security definer)
- El admin es un único usuario creado a mano en Supabase Auth — registro deshabilitado
- Nota: se agregó la columna `slug` a `demos` (no estaba en el plan original) para los deep links `?demo=slug`

## Comandos

- `npm run dev` — desarrollo (Turbopack)
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run gen:audio` — regenera los audios placeholder de `public/demos/`
- `npm run gen:types` — regenera tipos desde Supabase (requiere proyecto linkeado)

## Decisiones de diseño

- Paleta rosa claro por pedido de Agustina: fondo rosado (`--color-bg`), texto ciruela (`--color-cream`), acento rosa intenso (`--color-accent`); modo oscuro opcional en tonos rosados
- Orden público y menú: Inicio → Demos (audio) → Videos (Mis demos) → Trabajos → Sobre mí → Contacto. Los videos existentes siguen en `videos`; los trabajos se cargan aparte en `works` (`0003_works.sql`, `/admin/trabajos`)
- Tipografías: Fraunces (display, serif) + Sora (UI, sans) vía `next/font`
- Un solo elemento `<audio>` global (`components/player/GlobalAudio.tsx`); los waveforms de las cards
  son superficie de visualización/seek, nunca reproducen audio por sí mismos
- Audio y video nunca suenan a la vez: el lightbox de video pausa el player al abrirse
