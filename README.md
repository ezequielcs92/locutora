# Sitio One Page - Locutora

Portfolio autogestionable para una locutora profesional. Incluye demos de audio
filtrables, waveforms interactivos, videos embebidos en lightbox, formulario de
contacto y panel de administración para cargar, publicar y reordenar contenido.

## Stack

- Next.js 15 App Router + TypeScript estricto
- Tailwind CSS v4 con tokens en `app/globals.css`
- Motion (`motion/react`) con `prefers-reduced-motion`
- Lenis solo en el sitio público
- Wavesurfer.js v7 para visualizar y seekear demos
- Zustand para el player global
- Supabase Auth/Postgres con RLS
- Cloudflare R2 para audios mediante presigned URLs
- Resend para contacto
- dnd-kit para reordenamiento en admin

## Desarrollo local

```bash
npm install
npm run dev
```

El sitio público funciona sin credenciales: si no está configurado
`NEXT_PUBLIC_SUPABASE_URL`, se usan datos mock de `lib/mock-data.ts` y audios en
`public/demos/`.

El panel `/admin` requiere Supabase real.

## Variables de entorno

Tomá `.env.example` como referencia:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

RESEND_API_KEY=
CONTACT_EMAIL_TO=
RESEND_FROM_EMAIL=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase

1. Crear un proyecto en Supabase.
2. Ejecutar las migraciones de `supabase/migrations/` en orden.
3. Ejecutar `supabase/seed.sql` si querés datos iniciales.
4. Crear a mano el usuario administrador en Supabase Auth.
5. Mantener registro público deshabilitado.

La lectura pública está limitada por RLS a `is_published = true`; las mutaciones
requieren usuario autenticado.

## Cloudflare R2

El admin sube audios directo desde el navegador usando una presigned URL. El
bucket necesita CORS para aceptar `PUT` desde el dominio del sitio y desde
`http://localhost:3000` durante desarrollo.

Ejemplo de CORS para R2:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://tu-dominio.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Comandos

```bash
npm run dev       # desarrollo con Turbopack
npm run build     # build de producción
npm run lint      # ESLint
npm run gen:audio # regenera audios placeholder
npm run gen:types # tipos de Supabase, requiere proyecto linkeado
```

## Contenido

Los textos, enlaces, redes y datos de contacto están centralizados en
`lib/site-config.ts`. Antes de publicar con dominio real, actualizar ahí el
nombre, email, WhatsApp, redes, biografía y métricas.
