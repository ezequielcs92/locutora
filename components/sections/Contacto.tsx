"use client";

import { Check, Loader2, Mail, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import SocialIcon from "@/components/ui/SocialIcon";
import { siteConfig } from "@/lib/site-config";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function Contacto() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    siteConfig.whatsapp.message
  )}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          company: formData.get("company"),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo enviar el mensaje.");
      }

      setStatus("success");
      form.reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "No se pudo enviar el mensaje. Probá de nuevo."
      );
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-cream/10 bg-surface px-4 py-3 text-cream placeholder:text-muted/60 transition-colors focus:border-accent/60 focus:outline-none";

  return (
    <section id="contacto" className="py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading
          eyebrow="Contacto"
          title="Trabajemos juntos"
          description="Contame sobre tu proyecto y te respondo en menos de 24 horas. Si preferís algo más directo, escribime por WhatsApp."
        />

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Formulario */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted">Nombre</span>
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="Tu nombre"
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  placeholder="tu@email.com"
                  className={inputClasses}
                />
              </label>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted">Mensaje</span>
              <textarea
                name="message"
                required
                maxLength={3000}
                rows={5}
                placeholder="Contame sobre tu proyecto: tipo de locución, duración estimada, plazos…"
                className={`${inputClasses} resize-none`}
              />
            </label>
            <label className="hidden" aria-hidden="true">
              <span>Empresa</span>
              <input name="company" type="text" tabIndex={-1} autoComplete="off" />
            </label>

            <div className="mt-2 flex items-center gap-4">
              <motion.button
                type="submit"
                disabled={status === "sending" || status === "success"}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-bg transition-colors hover:bg-accent-strong disabled:opacity-70"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {status === "sending" ? (
                    <motion.span
                      key="sending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Loader2 size={18} className="animate-spin" /> Enviando…
                    </motion.span>
                  ) : status === "success" ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Check size={18} /> ¡Mensaje enviado!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Send size={18} /> Enviar mensaje
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <AnimatePresence>
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-400"
                  role="alert"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>

          {/* WhatsApp + redes */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-cream/10 bg-surface p-6 transition-colors hover:border-accent/40"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] transition-transform group-hover:scale-110">
                <MessageCircle size={26} />
              </span>
              <span>
                <span className="block font-semibold text-cream">Escribime por WhatsApp</span>
                <span className="block text-sm text-muted">
                  Respuesta rápida, de lunes a viernes
                </span>
              </span>
            </a>

            <a
              href={`mailto:${siteConfig.email}`}
              className="group flex items-center gap-4 rounded-2xl border border-cream/10 bg-surface p-6 transition-colors hover:border-accent/40"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent transition-transform group-hover:scale-110">
                <Mail size={24} />
              </span>
              <span>
                <span className="block font-semibold text-cream">{siteConfig.email}</span>
                <span className="block text-sm text-muted">Para propuestas y presupuestos</span>
              </span>
            </a>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-muted">Seguime en</span>
              {siteConfig.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/10 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <SocialIcon name={social.name} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
