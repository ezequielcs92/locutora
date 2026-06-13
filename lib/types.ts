export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Demo {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  r2_key: string;
  duration_seconds: number | null;
  file_size: number | null;
  play_count: number;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  platform: "youtube" | "vimeo";
  video_id: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

/** Demo ya resuelto para el sitio público: con URL de audio y nombre de categoría. */
export interface PublicDemo {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  durationSeconds: number | null;
  audioUrl: string;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PublicVideo {
  id: string;
  title: string;
  description: string | null;
  platform: "youtube" | "vimeo";
  videoId: string;
}
