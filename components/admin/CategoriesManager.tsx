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
import { Check, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
} from "@/app/admin/actions";
import type { Category } from "@/lib/types";

export type AdminCategory = Category & { demoCount: number };

function CategoryRow({
  category,
  onDelete,
  onRename,
  busy,
}: {
  category: AdminCategory;
  onDelete: () => void;
  onRename: (name: string) => void;
  busy: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  useEffect(() => setName(category.name), [category.name]);

  function commit() {
    setEditing(false);
    if (name.trim() && name.trim() !== category.name) onRename(name.trim());
    else setName(category.name);
  }

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

      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={80}
            className="min-w-0 flex-1 rounded-lg border border-accent/40 bg-bg px-3 py-1.5 text-cream focus:outline-none"
          />
          <button type="submit" aria-label="Guardar nombre" className="rounded-lg p-2 text-accent">
            <Check size={16} />
          </button>
          <button
            type="button"
            aria-label="Cancelar"
            onClick={() => {
              setEditing(false);
              setName(category.name);
            }}
            className="rounded-lg p-2 text-muted"
          >
            <X size={16} />
          </button>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-cream">{category.name}</p>
            <p className="text-xs text-muted">
              {category.demoCount === 1 ? "1 demo" : `${category.demoCount} demos`}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            aria-label={`Renombrar ${category.name}`}
            className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            aria-label={`Eliminar ${category.name}`}
            className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
    </li>
  );
}

export default function CategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [items, setItems] = useState(categories);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");

  useEffect(() => setItems(categories), [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    startTransition(async () => {
      const result = await reorderCategories(reordered.map((c) => c.id));
      if (!result.ok) setActionError(result.error);
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await createCategory(newName);
      if (!result.ok) setActionError(result.error);
      else {
        setNewName("");
        setActionError("");
        router.refresh();
      }
    });
  }

  function handleDelete(category: AdminCategory) {
    const warning =
      category.demoCount > 0
        ? `"${category.name}" tiene ${category.demoCount} demo(s) asociado(s). Los demos NO se borran, pero quedan sin categoría. ¿Eliminar igual?`
        : `¿Eliminar la categoría "${category.name}"?`;
    if (!window.confirm(warning)) return;

    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (!result.ok) setActionError(result.error);
      else router.refresh();
    });
  }

  function handleRename(category: AdminCategory, name: string) {
    startTransition(async () => {
      const result = await renameCategory(category.id, name);
      if (!result.ok) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-cream">Categorías</h1>
        <p className="mt-1 text-sm text-muted">
          Organizan los filtros de la sección de demos del sitio.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría…"
          maxLength={80}
          className="min-w-0 flex-1 rounded-xl border border-cream/10 bg-surface px-4 py-2.5 text-cream placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !newName.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-60"
        >
          <Plus size={17} />
          Crear
        </button>
      </form>

      {actionError && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {actionError}
        </p>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-cream/15 p-10 text-center text-muted">
          Todavía no hay categorías.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {items.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  busy={pending}
                  onDelete={() => handleDelete(category)}
                  onRename={(name) => handleRename(category, name)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
