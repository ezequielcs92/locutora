"use client";

import { motion } from "motion/react";
import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import VideoCard from "@/components/videos/VideoCard";
import VideoLightbox from "@/components/videos/VideoLightbox";
import type { PublicVideo } from "@/lib/types";
import { usePlayer } from "@/store/player";

interface TrabajosProps {
  videos: PublicVideo[];
}

export default function Trabajos({ videos }: TrabajosProps) {
  const [openVideo, setOpenVideo] = useState<PublicVideo | null>(null);

  function handleOpen(video: PublicVideo) {
    // Audio y video nunca a la vez: pausar el player al abrir un video
    usePlayer.getState().pause();
    setOpenVideo(video);
  }

  if (videos.length === 0) return null;

  return (
    <section id="trabajos" className="bg-surface/40 py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading
          eyebrow="Trabajos realizados"
          title="Mi voz en acción"
          description="Una selección de spots, institucionales y narraciones donde puse la voz."
        />

        <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
        </motion.div>
      </div>

      <VideoLightbox video={openVideo} onClose={() => setOpenVideo(null)} />
    </section>
  );
}
