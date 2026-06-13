"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { PublicVideo } from "@/lib/types";
import { videoEmbedUrl } from "@/lib/utils";

interface VideoLightboxProps {
  video: PublicVideo | null;
  onClose: () => void;
}

/** Modal que monta el iframe recién al abrirse, con autoplay. */
export default function VideoLightbox({ video, onClose }: VideoLightboxProps) {
  useEffect(() => {
    if (!video) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/90 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl"
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="truncate font-display text-lg font-medium text-cream">
                {video.title}
              </h3>
              <button
                onClick={onClose}
                aria-label="Cerrar video"
                className="shrink-0 rounded-full bg-cream/10 p-2.5 text-cream transition-colors hover:bg-cream/20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-cream/10 bg-black">
              <iframe
                src={videoEmbedUrl(video.platform, video.videoId)}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
