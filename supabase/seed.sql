-- Seed de desarrollo. Los r2_key apuntan a archivos que hay que subir a mano a R2
-- (o reemplazar por los reales desde el admin).

insert into public.categories (name, slug, sort_order) values
  ('Comercial',     'comercial',     0),
  ('Institucional', 'institucional', 1),
  ('IVR',           'ivr',           2),
  ('E-learning',    'e-learning',    3),
  ('Doblaje',       'doblaje',       4);

insert into public.demos (title, slug, description, category_id, r2_key, duration_seconds, sort_order, is_published)
select d.title, d.slug, d.description, c.id, d.r2_key, d.duration_seconds, d.sort_order, true
from (values
  ('Spot radial — Bebida',        'spot-radial-bebida',     'Spot de 30 segundos para radio, tono enérgico.',          'comercial',     'demos/placeholder-1.mp3', 30, 0),
  ('TV — Lanzamiento de producto','tv-lanzamiento-producto','Locución para TV, registro cálido y cercano.',            'comercial',     'demos/placeholder-2.mp3', 25, 1),
  ('Video institucional — Banco', 'institucional-banco',    'Narración corporativa, tono confiable.',                   'institucional', 'demos/placeholder-3.mp3', 45, 2),
  ('Central telefónica — Clínica','ivr-clinica',            'Menú IVR con opciones, dicción clara.',                    'ivr',           'demos/placeholder-4.mp3', 20, 3),
  ('Curso online — Seguridad',    'elearning-seguridad',    'Módulo e-learning, ritmo pausado y didáctico.',            'e-learning',    'demos/placeholder-5.mp3', 40, 4),
  ('Documental — Naturaleza',     'doblaje-documental',     'Doblaje de documental, registro narrativo.',               'doblaje',       'demos/placeholder-6.mp3', 35, 5)
) as d(title, slug, description, category_slug, r2_key, duration_seconds, sort_order)
join public.categories c on c.slug = d.category_slug;

insert into public.videos (title, description, platform, video_id, sort_order, is_published) values
  ('Reel de locución 2026',        'Compilado de trabajos recientes.',        'youtube', 'M7lc1UVf-VE', 0, true),
  ('Campaña — Marca de gaseosas',  'Spot televisivo nacional.',               'youtube', 'ysz5S6PUM-U', 1, true),
  ('Institucional — Universidad',  'Video institucional con voz en off.',     'youtube', 'aqz-KE-bpKQ', 2, true),
  ('Documental — Patagonia',       'Fragmento de narración documental.',      'vimeo',   '76979871',    3, true);
