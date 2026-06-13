"use client";

import { MicOff } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-accent/12 text-accent"
      >
        <MicOff size={44} strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display text-6xl font-medium text-cream sm:text-8xl"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 max-w-md text-muted"
      >
        Acá no hay nada grabado. La página que buscás no existe o se movió.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="mt-10"
      >
        <Link
          href="/"
          className="rounded-full bg-accent px-8 py-4 font-semibold text-bg transition-colors hover:bg-accent-strong"
        >
          Volver al inicio
        </Link>
      </motion.div>
    </main>
  );
}
