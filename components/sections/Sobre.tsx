"use client";

import { motion } from "motion/react";
import Image from "next/image";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site-config";

export default function Sobre() {
  return (
    <section id="sobre-mi" className="py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading eyebrow="Sobre mí" title="Detrás de la voz" />

        <div className="grid items-start gap-12 lg:grid-cols-[2fr_3fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-cream/10 bg-surface"
          >
            <Image
              src={siteConfig.portrait.src}
              alt={siteConfig.portrait.alt}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
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
