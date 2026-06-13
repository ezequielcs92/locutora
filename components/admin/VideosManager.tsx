"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  createVideo,
  deleteVideo,
  reorderVideos,
  toggleVideoPublished,
  updateVideo,
} from "@/app/admin/actions";
import type { Video } from "@/lib/types";
import { parseVideoUrl, videoThumbnailUrl, type ParsedVideoUrl } from "@/lib/utils";

/* ---------- Fila sortable ---------- */

function VideoRow({
  video,
  onEdit,
  onDelete,
  onTogglePublished,
  busy,
}: {
  video: Video;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublished: () => void;
  busy: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xl border border-cream/8 bg-surface p-3 ${
        isDragging ? "z-10 opacity-80 shadow-xl" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para reordenar"
        className="shrink-0 cursor-grab touch-none rounded p-1 text-muted hover:text-cream active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={videoThumbnailUrl(video.platform, video.video_id)}
        alt=""
        className="h-12 w-20 shrink-0 rounded-lg border border-cream/10 object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-cream">{video.title}</p>
        <p className="truncate text-xs uppercase text-muted">{video.platform}</p>
      </div>

      <button
        onClick={onTogglePublished}
        disabled={busy}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          video.is_published
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-cream/8 text-muted hover:text-cream"
        }`}
      >
        {video.is_published ? "Publicado" : "Borrador"}
      </button>

      <button
        onClick={onEdit}
        aria-label={`Editar ${video.title}`}
        className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-cream/5 hover:text-cream"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        aria-label={`Eliminar ${video.title}`}
        className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

/* ---------- Formulario ---------- */

function VideoForm({ video, onClose }: { video: Video | null; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedVideoUrl | null>(
    video ? { platform: video.platform, videoId: video.video_id } : null
  );
  const [urlValue, setUrlValue] = useState(
    video
      ? video.platform === "youtube"
        ? `https://www.youtube.com/watch?v=${video.video_id}`
        : `https://vimeo.com/${video.video_id}`
      : ""
  );

  function handleUrlChange(value: string) {
    setUrlValue(value);
    setParsed(parseVideoUrl(value));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!parsed) {
      setError("Pegá una URL válida de YouTube o Vimeo.");
      return;
    }
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const input = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      platform: parsed.platform,
      videoId: parsed.videoId,
      isPublished: formData.get("isPublished") === "on",
    };

    const result = video ? await updateVideo(video.id, input) : await createVideo(input);

    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    router.refresh();
    onClose();
  }

  const inputClasses =
    "w-full rounded-xl border border-cream/10 bg-bg px-4 py-2.5 text-cream focus:border-accent/60 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cream/10 bg-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-cream">
            {video ? "Editar video" : "Nuevo video"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-muted hover:bg-cream/5 hover:text-cream"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">URL de YouTube o Vimeo</span>
            <input
              type="url"
              required
              value={urlValue}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputClasses}
            />
          </label>

          {parsed ? (
            <div className="flex items-center gap-3 rounded-xl border border-cream/10 bg-bg p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={videoThumbnailUrl(parsed.platform, parsed.videoId)}
                alt="Preview del video"
                className="h-14 w-24 rounded-lg object-cover"
              />
              <p className="text-xs text-muted">
                <span className="font-semibold uppercase text-accent">{parsed.platform}</span>
                <br />
                ID: {parsed.videoId}
              </p>
            </div>
          ) : urlValue ? (
            <p className="text-xs text-amber-400">
              No se reconoce la URL. Tiene que ser de YouTube o Vimeo.
            </p>
          ) : null}

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Título</span>
            <input
              name="title"
              type="text"
              required
              maxLength={150}
              defaultValue={video?.title ?? ""}
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Descripción (opcional)</span>
            <textarea
              name="description"
              rows={3}
              maxLength={500}
              defaultValue={video?.description ?? ""}
              className={`${inputClasses} resize-none`}
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={video?.is_published ?? false}
              className="h-4 w-4 accent-[#d9a154]"
            />
            <span className="text-sm text-cream">Publicar en el sitio</span>
          </label>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm text-muted hover:text-cream"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-70"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {video ? "Guardar cambios" : "Agregar video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Manager ---------- */

export default function VideosManager({ videos }: { videos: Video[] }) {
  const router = useRouter();
  const [items, setItems] = useState(videos);
  const [formState, setFormState] = useState<{ open: boolean; video: Video | null }>({
    open: false,
    video: null,
  });
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");

  useEffect(() => setItems(videos), [videos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((v) => v.id === active.id);
    const newIndex = items.findIndex((v) => v.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    startTransition(async () => {
      const result = await reorderVideos(reordered.map((v) => v.id));
      if (!result.ok) setActionError(result.error);
    });
  }

  function handleDelete(video: Video) {
    if (!window.confirm(`¿Eliminar "${video.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteVideo(video.id);
      if (!result.ok) setActionError(result.error);
      else router.refresh();
    });
  }

  function handleTogglePublished(video: Video) {
    startTransition(async () => {
      const result = await toggleVideoPublished(video.id, !video.is_published);
      if (!result.ok) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-cream">Videos</h1>
          <p className="mt-1 text-sm text-muted">
            Pegá la URL de YouTube o Vimeo: el sistema detecta la plataforma solo.
          </p>
        </div>
        <button
          onClick={() => setFormState({ open: true, video: null })}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong"
        >
          <Plus size={17} />
          Nuevo video
        </button>
      </div>

      {actionError && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {actionError}
        </p>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-cream/15 p-10 text-center text-muted">
          Todavía no hay videos cargados.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {items.map((video) => (
                <VideoRow
                  key={video.id}
                  video={video}
                  busy={pending}
                  onEdit={() => setFormState({ open: true, video })}
                  onDelete={() => handleDelete(video)}
                  onTogglePublished={() => handleTogglePublished(video)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {formState.open && (
        <VideoForm video={formState.video} onClose={() => setFormState({ open: false, video: null })} />
      )}
    </div>
  );
}
