"use client";

import { Mic } from "lucide-react";
import { motion } from "motion/react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site-config";

export default function Sobre() {
  return (
    <section id="sobre-mi" className="py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading eyebrow="Sobre mí" title="Detrás de la voz" />

        <div className="grid items-start gap-12 lg:grid-cols-[2fr_3fr]">
          {/* Foto (placeholder hasta tener las fotos profesionales) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-cream/10 bg-gradient-to-br from-surface-2 via-surface to-bg"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted">
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Mic size={40} strokeWidth={1.5} />
              </span>
              <p className="px-8 text-center text-sm">
                Acá va la foto profesional de {siteConfig.name}
              </p>
            </div>
            <div
              aria-hidden
              className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
            />
          </motion.div>

          <div>
            {siteConfig.bio.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="mb-5 text-lg leading-relaxed text-cream/85"
              >
                {paragraph}
              </motion.p>
            ))}

            {/* Highlights con contadores animados */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {siteConfig.highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                  className="rounded-2xl border border-cream/8 bg-surface p-4 sm:p-5"
                >
                  <AnimatedCounter
                    value={item.value}
                    suffix={item.suffix}
                    className="font-display text-3xl font-medium text-accent sm:text-4xl"
                  />
                  <p className="mt-1 text-xs leading-snug text-muted sm:text-sm">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
