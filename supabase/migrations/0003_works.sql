-- Trabajos realizados se cargan aparte de los demos audiovisuales (videos).
-- No mueve, modifica ni elimina los videos existentes.
create table public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  platform text not null check (platform in ('youtube', 'vimeo')),
  video_id text not null,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz default now()
);

create index works_published_order_idx on public.works (is_published, sort_order);
alter table public.works enable row level security;

create policy "works_select_published" on public.works
  for select to anon using (is_published = true);
create policy "works_select_auth" on public.works
  for select to authenticated using (true);
create policy "works_insert_auth" on public.works
  for insert to authenticated with check (true);
create policy "works_update_auth" on public.works
  for update to authenticated using (true) with check (true);
create policy "works_delete_auth" on public.works
  for delete to authenticated using (true);

grant select on public.works to anon, authenticated;
grant insert, update, delete on public.works to authenticated;
grant all on public.works to service_role;
