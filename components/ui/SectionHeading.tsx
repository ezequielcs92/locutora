"use client";

import { motion, useReducedMotion } from "motion/react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

/** Encabezado de sección con reveal al entrar en viewport. */
export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  const reduced = useReducedMotion();
  const words = title.split(" ");

  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-10 sm:mb-14"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-medium text-cream sm:text-4xl lg:text-5xl">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-1 pr-2">
            <motion.span
              className="inline-block"
              initial={reduced ? false : { y: "115%", rotate: 2 }}
              whileInView={reduced ? undefined : { y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{
                duration: 0.75,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>
      <motion.div
        aria-hidden
        className="mt-5 h-px max-w-48 bg-gradient-to-r from-accent via-accent/50 to-transparent"
        initial={reduced ? false : { scaleX: 0, opacity: 0 }}
        whileInView={reduced ? undefined : { scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left" }}
      />
      {description ? (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </motion.header>
  );
}
