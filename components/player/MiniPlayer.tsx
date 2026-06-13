"use client";

import { Pause, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/store/player";

/**
 * Mini-player sticky inferior: aparece cuando hay un demo cargado
 * y persiste mientras se navega todo el one-page.
 */
export default function MiniPlayer() {
  const demo = usePlayer((s) => s.demo);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const currentTime = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);
  const toggle = usePlayer((s) => s.toggle);
  const close = usePlayer((s) => s.close);
  const seek = usePlayer((s) => s.seek);

  const barRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  function handleBarClick(e: React.MouseEvent) {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    seek(ratio * duration);
  }

  return (
    <AnimatePresence>
      {demo && (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-cream/10 bg-surface/90 backdrop-blur-lg"
          role="region"
          aria-label="Reproductor de audio"
        >
          {/* Barra de progreso seekeable */}
          <div
            ref={barRef}
            onClick={handleBarClick}
            role="slider"
            aria-label="Progreso de la reproducción"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seek(Math.min(currentTime + 5, duration));
              if (e.key === "ArrowLeft") seek(Math.max(currentTime - 5, 0));
            }}
            className="group/bar relative h-2 w-full cursor-pointer"
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-cream/10" />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-accent transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 transition-opacity group-hover/bar:opacity-100"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          <div className="section-container flex items-center gap-3 py-3 sm:gap-4">
            <motion.button
              onClick={toggle}
              whileTap={{ scale: 0.9 }}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg"
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </motion.button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-cream">{demo.title}</p>
              <p className="truncate text-xs text-muted">
                {demo.categoryName ?? "Demo"} ·{" "}
                <span className="tabular-nums">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </p>
            </div>

            <button
              onClick={close}
              aria-label="Cerrar reproductor"
              className="shrink-0 rounded-full p-2.5 text-muted transition-colors hover:bg-cream/5 hover:text-cream"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
