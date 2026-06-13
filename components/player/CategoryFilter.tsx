"use client";

import { motion } from "motion/react";
import type { PublicCategory } from "@/lib/types";

interface CategoryFilterProps {
  categories: PublicCategory[];
  active: string | null; // null = todas
  onChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  const pills: { id: string | null; name: string }[] = [
    { id: null, name: "Todos" },
    ...categories.map((c) => ({ id: c.id as string | null, name: c.name })),
  ];

  return (
    <div
      role="tablist"
      aria-label="Filtrar demos por categoría"
      className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {pills.map((pill) => {
        const isActive = active === pill.id;
        return (
          <button
            key={pill.id ?? "all"}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(pill.id)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              isActive ? "text-bg" : "text-muted hover:text-cream"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 font-medium">{pill.name}</span>
          </button>
        );
      })}
    </div>
  );
}
