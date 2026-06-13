"use client";

import { Play } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import type { PublicVideo } from "@/lib/types";
import { videoThumbnailUrl } from "@/lib/utils";

interface VideoCardProps {
  video: PublicVideo;
  onOpen: (video: PublicVideo) => void;
}

/** Card con thumbnail estática — sin iframe (se monta recién en el lightbox). */
export default function VideoCard({ video, onOpen }: VideoCardProps) {
  return (
    <motion.button
      onClick={() => onOpen(video)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group block w-full text-left"
      aria-label={`Reproducir video: ${video.title}`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-cream/8 bg-surface">
        <Image
          src={videoThumbnailUrl(video.platform, video.videoId)}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay con ícono de play */}
        <div className="absolute inset-0 flex items-center justify-center bg-bg/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <motion.span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-bg shadow-xl"
            initial={false}
            whileHover={{ scale: 1.1 }}
          >
            <Play size={24} fill="currentColor" className="ml-1" />
          </motion.span>
        </div>
      </div>
      <h3 className="mt-3 font-display text-lg font-medium text-cream">{video.title}</h3>
      {video.description && <p className="mt-1 text-sm text-muted">{video.description}</p>}
    </motion.button>
  );
}
