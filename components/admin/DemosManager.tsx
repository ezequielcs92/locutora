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
import { BarChart2, GripVertical, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  createDemo,
  deleteDemo,
  reorderDemos,
  toggleDemoPublished,
  updateDemo,
} from "@/app/admin/actions";
import type { Category, Demo } from "@/lib/types";
import { formatBytes, formatDuration } from "@/lib/utils";

export type AdminDemo = Demo & { category: { id: string; name: string } | null };

/* ---------- Helpers de upload ---------- */

async function getAudioDuration(file: File): Promise<number | null> {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    const duration = buffer.duration;
    await ctx.close();
    return Math.round(duration * 100) / 100;
  } catch {
    return null;
  }
}

function uploadWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`La subida falló (HTTP ${xhr.status}). Revisá el CORS del bucket R2.`));
    xhr.onerror = () => reject(new Error("Error de red durante la subida. Revisá el CORS del bucket R2."));
    xhr.send(file);
  });
}

/* ---------- Fila sortable ---------- */

function DemoRow({
  demo,
  onEdit,
  onDelete,
  onTogglePublished,
  busy,
}: {
  demo: AdminDemo;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublished: () => void;
  busy: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: demo.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xl border border-cream/8 bg-surface p-3 sm:p-4 ${
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

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-cream">{demo.title}</p>
        <p className="truncate text-xs text-muted">
          {demo.category?.name ?? "Sin categoría"} · {formatDuration(demo.duration_seconds)} ·{" "}
          {formatBytes(demo.file_size)}
        </p>
      </div>

      <span
        className="hidden items-center gap-1.5 text-sm tabular-nums text-muted sm:flex"
        title="Reproducciones"
      >
        <BarChart2 size={15} />
        {demo.play_count}
      </span>

      <button
        onClick={onTogglePublished}
        disabled={busy}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          demo.is_published
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-cream/8 text-muted hover:text-cream"
        }`}
      >
        {demo.is_published ? "Publicado" : "Borrador"}
      </button>

      <button
        onClick={onEdit}
        aria-label={`Editar ${demo.title}`}
        className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-cream/5 hover:text-cream"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        aria-label={`Eliminar ${demo.title}`}
        className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

/* ---------- Formulario (alta / edición) ---------- */

function DemoForm({
  demo,
  categories,
  onClose,
}: {
  demo: AdminDemo | null; // null = nuevo
  categories: Category[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const input = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      categoryId: String(formData.get("categoryId") ?? "") || null,
      isPublished: formData.get("isPublished") === "on",
    };

    try {
      let result;
      if (demo) {
        result = await updateDemo(demo.id, input);
      } else {
        const file = formData.get("file") as File | null;
        if (!file || file.size === 0) throw new Error("Seleccioná un archivo de audio.");
        if (!file.type.startsWith("audio/"))
          throw new Error("El archivo tiene que ser de audio (MP3 recomendado).");

        // 1. Duración en el cliente (Web Audio API)
        const durationSeconds = await getAudioDuration(file);

        // 2. Presigned URL
        const res = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        });
        const presign = await res.json();
        if (!res.ok) throw new Error(presign.error ?? "No se pudo iniciar la subida.");

        // 3. Upload directo browser → R2 con progreso
        setUploadPct(0);
        await uploadWithProgress(presign.uploadUrl, file, setUploadPct);
        setUploadPct(null);

        // 4. Crear la fila
        result = await createDemo({
          ...input,
          r2Key: presign.key,
          durationSeconds,
          fileSize: file.size,
        });
      }

      if (!result.ok) throw new Error(result.error);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
      setSaving(false);
      setUploadPct(null);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-cream/10 bg-bg px-4 py-2.5 text-cream focus:border-accent/60 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cream/10 bg-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-cream">
            {demo ? "Editar demo" : "Nuevo demo"}
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
          {!demo && (
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted">Archivo de audio (MP3 recomendado)</span>
              <input
                name="file"
                type="file"
                accept="audio/*"
                required
                className="rounded-xl border border-dashed border-cream/20 bg-bg px-4 py-3 text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:font-semibold file:text-bg"
              />
            </label>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Título</span>
            <input
              name="title"
              type="text"
              required
              maxLength={150}
              defaultValue={demo?.title ?? ""}
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Descripción (opcional)</span>
            <textarea
              name="description"
              rows={3}
              maxLength={500}
              defaultValue={demo?.description ?? ""}
              className={`${inputClasses} resize-none`}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Categoría</span>
            <select
              name="categoryId"
              defaultValue={demo?.category_id ?? ""}
              className={inputClasses}
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3">
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={demo?.is_published ?? false}
              className="h-4 w-4 accent-[#d9a154]"
            />
            <span className="text-sm text-cream">Publicar en el sitio</span>
          </label>

          {uploadPct !== null && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Subiendo audio…</span>
                <span>{uploadPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-cream/10">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-200"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            </div>
          )}

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
              {demo ? "Guardar cambios" : "Crear demo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Manager principal ---------- */

export default function DemosManager({
  demos,
  categories,
}: {
  demos: AdminDemo[];
  categories: Category[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(demos);
  const [formState, setFormState] = useState<{ open: boolean; demo: AdminDemo | null }>({
    open: false,
    demo: null,
  });
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");

  useEffect(() => setItems(demos), [demos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((d) => d.id === active.id);
    const newIndex = items.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    startTransition(async () => {
      const result = await reorderDemos(reordered.map((d) => d.id));
      if (!result.ok) setActionError(result.error);
    });
  }

  function handleTogglePublished(demo: AdminDemo) {
    startTransition(async () => {
      const result = await toggleDemoPublished(demo.id, !demo.is_published);
      if (!result.ok) setActionError(result.error);
      else router.refresh();
    });
  }

  function handleDelete(demo: AdminDemo) {
    if (
      !window.confirm(
        `¿Eliminar "${demo.title}"? También se borra el archivo de audio. Esta acción no se puede deshacer.`
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteDemo(demo.id);
      if (!result.ok) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-cream">Demos</h1>
          <p className="mt-1 text-sm text-muted">
            Arrastrá para reordenar. El orden se refleja en el sitio.
          </p>
        </div>
        <button
          onClick={() => setFormState({ open: true, demo: null })}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong"
        >
          <Plus size={17} />
          Nuevo demo
        </button>
      </div>

      {actionError && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {actionError}
        </p>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-cream/15 p-10 text-center text-muted">
          Todavía no hay demos. Subí el primero con &quot;Nuevo demo&quot;.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {items.map((demo) => (
                <DemoRow
                  key={demo.id}
                  demo={demo}
                  busy={pending}
                  onEdit={() => setFormState({ open: true, demo })}
                  onDelete={() => handleDelete(demo)}
                  onTogglePublished={() => handleTogglePublished(demo)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {formState.open && (
        <DemoForm
          demo={formState.demo}
          categories={categories}
          onClose={() => setFormState({ open: false, demo: null })}
        />
      )}
    </div>
  );
}
