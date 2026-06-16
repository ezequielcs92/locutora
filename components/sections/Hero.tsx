"use client";

import { useLenis } from "lenis/react";
import { ChevronDown, Pause, Play, Radio } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import MagneticButton from "@/components/ui/MagneticButton";
import { siteConfig } from "@/lib/site-config";
import type { PublicDemo } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/store/player";

/** Barras decorativas tipo waveform animadas en loop. */
function WaveformBackdrop({ dense = false }: { dense?: boolean }) {
  const reduced = useReducedMotion();
  const bars = dense ? 76 : 48;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-1 opacity-25 sm:gap-1.5 ${
        dense ? "h-64 sm:h-[28rem]" : "h-40 sm:h-56"
      }`}
      style={{
        maskImage: "linear-gradient(to top, black 30%, transparent)",
        WebkitMaskImage: "linear-gradient(to top, black 30%, transparent)",
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const base = 0.25 + 0.6 * Math.abs(Math.sin((i / bars) * Math.PI * 2.4));
        const height = `${(base * 100).toFixed(4)}%`;
        return (
          <motion.span
            key={i}
            className="w-1.5 rounded-full bg-accent sm:w-2"
            style={{ height }}
            animate={
              reduced
                ? undefined
                : { scaleY: [1, 0.35 + Math.abs(Math.sin(i * 1.7)) * 0.9, 1] }
            }
            transition={{
              duration: 1.6 + (i % 5) * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 7) * 0.18,
            }}
          />
        );
      })}
    </div>
  );
}

function HeroDemoPanel({ demo }: { demo?: PublicDemo }) {
  const reduced = useReducedMotion();
  const activeDemoId = usePlayer((s) => s.demo?.id);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const currentTime = usePlayer((s) => s.currentTime);
  const play = usePlayer((s) => s.play);
  const toggle = usePlayer((s) => s.toggle);

  const isActive = Boolean(demo && activeDemoId === demo.id);
  const progress =
    demo?.durationSeconds && isActive
      ? Math.min((currentTime / demo.durationSeconds) * 100, 100)
      : 34;

  function handlePlay() {
    if (!demo) return;
    if (isActive) toggle();
    else play(demo);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -4 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-md lg:ml-auto"
    >
      <motion.div
        aria-hidden
        className="absolute -inset-8 rounded-[2rem] border border-accent/10"
        animate={reduced ? undefined : { rotate: [-3, 2, -3], scale: [1, 1.03, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-cream/10 bg-surface/80 p-5 shadow-[0_30px_120px_-45px_rgba(217,161,84,0.65)] backdrop-blur-xl sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(244,237,227,0.08),transparent_42%,rgba(217,161,84,0.16))]" />
        <div className="relative flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            <Radio size={14} />
            Reel destacado
          </span>
          <span className="text-xs tabular-nums text-muted">
            {formatDuration(demo?.durationSeconds)}
          </span>
        </div>

        <div className="relative mt-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {demo?.categoryName ?? "Demo"}
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium leading-none text-cream sm:text-4xl">
            {demo?.title ?? "Demo principal"}
          </h2>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
            {demo?.description ?? "Escuchá una muestra de voz antes de recorrer el portfolio."}
          </p>
        </div>

        <div className="relative mt-8 flex h-28 items-end gap-1.5 overflow-hidden rounded-2xl border border-cream/8 bg-bg/55 px-4 pb-4 pt-6">
          {Array.from({ length: 34 }).map((_, i) => {
            const height = 26 + Math.abs(Math.sin(i * 1.37)) * 62;
            const isLit = i < Math.round(progress / 3);
            return (
              <motion.span
                key={i}
                className={`w-full rounded-full ${isLit ? "bg-accent" : "bg-cream/12"}`}
                style={{ height: `${height.toFixed(2)}%` }}
                animate={
                  reduced
                    ? undefined
                    : {
                        scaleY: isActive && isPlaying ? [1, 0.45 + (i % 5) * 0.18, 1] : 1,
                      }
                }
                transition={{
                  duration: 0.85 + (i % 4) * 0.12,
                  repeat: isActive && isPlaying ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        <div className="relative mt-5 flex items-center gap-4">
          <motion.button
            type="button"
            onClick={handlePlay}
            disabled={!demo}
            whileTap={{ scale: 0.92 }}
            aria-label={isActive && isPlaying ? "Pausar reel destacado" : "Reproducir reel destacado"}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-bg shadow-[0_0_34px_rgba(217,161,84,0.35)] transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {isActive && isPlaying ? (
              <Pause size={21} fill="currentColor" />
            ) : (
              <Play size={21} fill="currentColor" className="ml-0.5" />
            )}
          </motion.button>
          <div className="min-w-0 flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-cream/10">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {isActive && isPlaying ? "Reproduciendo ahora" : "Un toque y suena"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function pickRandomDemo(demos: PublicDemo[]): PublicDemo | undefined {
  if (!demos.length) return undefined;
  return demos[Math.floor(Math.random() * demos.length)];
}

export default function Hero({ featuredDemos }: { featuredDemos: PublicDemo[] }) {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const [featuredDemo, setFeaturedDemo] = useState<PublicDemo | undefined>(
    () => featuredDemos[0]
  );

  useEffect(() => {
    setFeaturedDemo(pickRandomDemo(featuredDemos));
  }, [featuredDemos]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const titleWords = siteConfig.tagline.split(" ");

  function goToDemos() {
    const el = document.getElementById("demos");
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="inicio"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div
        aria-hidden
        className="sound-grid absolute inset-0 opacity-[0.18]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(217,161,84,0.08),transparent_48%),linear-gradient(180deg,rgba(14,12,9,0.18)_0%,rgba(14,12,9,0.55)_94%)]"
      />
      <motion.div
        aria-hidden
        className="absolute left-0 right-0 top-20 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <WaveformBackdrop dense />

      <motion.div
        style={reduced ? undefined : { y, opacity }}
        className="section-container relative z-10 grid items-center gap-12 pb-24 pt-28 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-accent"
          >
            {siteConfig.name} · {siteConfig.role}
          </motion.p>

          <h1 className="max-w-4xl font-display text-5xl font-medium leading-[0.95] text-cream sm:text-7xl lg:text-8xl">
            {titleWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 pr-2 align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "120%", rotate: 3 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.22 + i * 0.09,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                  {i < titleWords.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            Voz profesional para publicidad, institucionales, IVR, e-learning y doblaje.
            Calidad broadcast desde estudio propio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton
              onClick={goToDemos}
              className="rounded-full bg-accent px-8 py-4 text-base font-semibold text-bg shadow-[0_0_44px_rgba(217,161,84,0.22)] transition-colors hover:bg-accent-strong"
            >
              Escuchá mis demos
            </MagneticButton>
          </motion.div>
        </div>

        <HeroDemoPanel demo={featuredDemo} />
      </motion.div>

      {/* Indicador de scroll */}
      <motion.button
        onClick={goToDemos}
        aria-label="Bajar a la sección de demos"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-muted"
      >
        <motion.span
          className="block"
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={28} />
        </motion.span>
      </motion.button>
    </section>
  );
}
