"use client";

import { motion } from "motion/react";
import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import VideoCard from "@/components/videos/VideoCard";
import VideoLightbox from "@/components/videos/VideoLightbox";
import type { PublicVideo } from "@/lib/types";
import { usePlayer } from "@/store/player";

interface VideoGalleryProps {
  videos: PublicVideo[];
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  emptyMessage: string;
}

export default function VideoGallery({ videos, id, eyebrow, title, description, emptyMessage }: VideoGalleryProps) {
  const [openVideo, setOpenVideo] = useState<PublicVideo | null>(null);

  function handleOpen(video: PublicVideo) {
    // Audio y video nunca a la vez: pausar el player al abrir un video
    usePlayer.getState().pause();
    setOpenVideo(video);
  }

  return (
    <section id={id} className="bg-surface/40 py-20 sm:py-28">
      <div className="section-container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {videos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-accent/20 px-5 py-10 text-center text-muted">
            {emptyMessage}
          </p>
        ) : <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.24) }}
            >
              <VideoCard video={video} onOpen={handleOpen} />
            </motion.div>
          ))}
        </motion.div>}
      </div>

      <VideoLightbox video={openVideo} onClose={() => setOpenVideo(null)} />
    </section>
  );
}
