-- Migración inicial: tablas, RLS y RPC.
-- Correr en el SQL Editor de Supabase (o con supabase db push).

-- ============ Tablas ============

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table public.demos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,            -- para deep links ?demo=slug
  description text,
  category_id uuid references public.categories(id) on delete set null,
  r2_key text not null,                 -- path del archivo en R2
  duration_seconds numeric,
  file_size bigint,
  play_count int not null default 0,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  platform text not null check (platform in ('youtube','vimeo')),
  video_id text not null,               -- ID extraído de la URL
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz default now()
);

create index demos_category_id_idx on public.demos (category_id);
create index demos_published_order_idx on public.demos (is_published, sort_order);
create index videos_published_order_idx on public.videos (is_published, sort_order);

-- ============ RLS ============

alter table public.categories enable row level security;
alter table public.demos enable row level security;
alter table public.videos enable row level security;

-- Categorías: lectura pública total, escritura solo autenticados
create policy "categories_select_public" on public.categories
  for select using (true);
create policy "categories_insert_auth" on public.categories
  for insert to authenticated with check (true);
create policy "categories_update_auth" on public.categories
  for update to authenticated using (true) with check (true);
create policy "categories_delete_auth" on public.categories
  for delete to authenticated using (true);

-- Demos: el público solo ve lo publicado; autenticados ven y editan todo
create policy "demos_select_published" on public.demos
  for select to anon using (is_published = true);
create policy "demos_select_auth" on public.demos
  for select to authenticated using (true);
create policy "demos_insert_auth" on public.demos
  for insert to authenticated with check (true);
create policy "demos_update_auth" on public.demos
  for update to authenticated using (true) with check (true);
create policy "demos_delete_auth" on public.demos
  for delete to authenticated using (true);

-- Videos: ídem demos
create policy "videos_select_published" on public.videos
  for select to anon using (is_published = true);
create policy "videos_select_auth" on public.videos
  for select to authenticated using (true);
create policy "videos_insert_auth" on public.videos
  for insert to authenticated with check (true);
create policy "videos_update_auth" on public.videos
  for update to authenticated using (true) with check (true);
create policy "videos_delete_auth" on public.videos
  for delete to authenticated using (true);

-- ============ RPC: contador de reproducciones ============
-- security definer para que el público pueda sumar sin permiso de update.

create or replace function public.increment_play_count(demo_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.demos
     set play_count = play_count + 1
   where id = demo_id
     and is_published = true;
$$;

revoke all on function public.increment_play_count(uuid) from public;
grant execute on function public.increment_play_count(uuid) to anon, authenticated;
