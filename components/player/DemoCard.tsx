"use client";

import { Check, Pause, Play, Share2 } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import Waveform from "@/components/player/Waveform";
import type { PublicDemo } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/store/player";

interface DemoCardProps {
  demo: PublicDemo;
  highlighted?: boolean;
}

export default function DemoCard({ demo, highlighted = false }: DemoCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const activeDemoId = usePlayer((s) => s.demo?.id);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const currentTime = usePlayer((s) => s.currentTime);
  const play = usePlayer((s) => s.play);
  const toggle = usePlayer((s) => s.toggle);
  const seek = usePlayer((s) => s.seek);

  const isActive = activeDemoId === demo.id;
  const [copied, setCopied] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), {
    stiffness: 180,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 180,
    damping: 20,
  });

  function handlePlayPause() {
    if (isActive) toggle();
    else play(demo);
  }

  function handleSeek(time: number) {
    if (isActive) {
      seek(time);
    } else {
      play(demo);
      seek(time);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/?demo=${demo.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard no disponible: abrir el share nativo si existe
      if (navigator.share) void navigator.share({ url, title: demo.title });
    }
  }

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
      whileHover={reduced ? undefined : { y: -6 }}
      onMouseMove={(event) => {
        if (reduced || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl border bg-surface p-5 transition-colors ${
        highlighted
          ? "border-accent/60 shadow-[0_0_40px_-12px_rgba(217,161,84,0.45)]"
          : isActive
            ? "border-accent/40"
            : "border-cream/8 hover:border-cream/20"
      }`}
    >
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive || highlighted ? 1 : 0.28 }}
        transition={{ duration: 0.45 }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-16 top-0 h-44 w-32 rotate-12 bg-accent/10 blur-2xl"
        animate={reduced ? undefined : { x: isActive ? [-20, 8, -20] : 0, opacity: isActive ? [0.35, 0.75, 0.35] : 0.25 }}
        transition={{ duration: 3.6, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
      />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {demo.categoryName && (
              <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                {demo.categoryName}
              </span>
            )}
            <span className="text-xs tabular-nums text-muted">
              {formatDuration(demo.durationSeconds)}
            </span>
          </div>
          <h3 className="truncate font-display text-lg font-medium text-cream">{demo.title}</h3>
          {demo.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{demo.description}</p>
          )}
        </div>

        <button
          onClick={handleShare}
          aria-label={`Compartir ${demo.title}`}
          title="Copiar link del demo"
          className="shrink-0 rounded-full p-2 text-muted transition-colors hover:bg-cream/5 hover:text-cream"
        >
          {copied ? <Check size={17} className="text-accent" /> : <Share2 size={17} />}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          onClick={handlePlayPause}
          whileTap={{ scale: 0.92 }}
          aria-label={
            isActive && isPlaying ? `Pausar ${demo.title}` : `Reproducir ${demo.title}`
          }
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${
            isActive
              ? "bg-accent text-bg"
              : "bg-cream/8 text-cream group-hover:bg-accent group-hover:text-bg"
          }`}
        >
          {isActive && isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </motion.button>

        <div className="min-w-0 flex-1">
          <Waveform
            url={demo.audioUrl}
            isActive={isActive}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>
      </div>
    </motion.article>
  );
}
