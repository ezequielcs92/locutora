"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import CategoryFilter from "@/components/player/CategoryFilter";
import DemoCard from "@/components/player/DemoCard";
import SectionHeading from "@/components/ui/SectionHeading";
import type { PublicCategory, PublicDemo } from "@/lib/types";
import { usePlayer } from "@/store/player";

interface DemosProps {
  demos: PublicDemo[];
  categories: PublicCategory[];
}

export default function Demos({ demos, categories }: DemosProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const deepLinkHandled = useRef(false);

  // Solo mostrar categorías que tengan al menos un demo
  const visibleCategories = categories.filter((c) =>
    demos.some((d) => d.categoryId === c.id)
  );

  const filtered = activeCategory
    ? demos.filter((d) => d.categoryId === activeCategory)
    : demos;

  // Deep link ?demo=slug → cargar ese demo en el player (sin autoplay,
  // iOS bloquea audio sin interacción del usuario) y scrollear hasta él.
  useEffect(() => {
    if (deepLinkHandled.current) return;
    deepLinkHandled.current = true;

    const slug = new URLSearchParams(window.location.search).get("demo");
    if (!slug) return;
    const demo = demos.find((d) => d.slug === slug);
    if (!demo) return;

    usePlayer.getState().play(demo, false);
    setHighlightedId(demo.id);

    setTimeout(() => {
      document.getElementById(`demo-${demo.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 400);
    setTimeout(() => setHighlightedId(null), 4000);
  }, [demos]);

  return (
    <section id="demos" className="relative overflow-hidden py-24 sm:py-32">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 font-display text-[18vw] leading-none text-cream/[0.025] lg:block"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        demos
      </motion.div>
      <div className="section-container relative">
        <SectionHeading
          eyebrow="Demos"
          title="Escuchá mi voz"
          description="Filtrá por categoría y reproducí los demos. El player te acompaña mientras recorrés el sitio."
        />

        <CategoryFilter
          categories={visibleCategories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted">
            Todavía no hay demos publicados en esta categoría.
          </p>
        ) : (
          <motion.div layout className="grid gap-5 md:grid-cols-2 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  id={`demo-${demo.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.24) }}
                >
                  <DemoCard demo={demo} highlighted={highlightedId === demo.id} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
