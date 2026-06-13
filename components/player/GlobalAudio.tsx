"use client";

import { useEffect, useRef } from "react";
import { isSupabasePublicConfigured, registerPlay } from "@/lib/play-count";
import { usePlayer } from "@/store/player";

/**
 * Único elemento <audio> del sitio. Reproduce lo que diga el store del player;
 * los waveforms de las cards son solo superficie de visualización/seek.
 */
export default function GlobalAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const demo = usePlayer((s) => s.demo);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const seekRequest = usePlayer((s) => s.seekRequest);
  const volume = usePlayer((s) => s.volume);

  // Cambio de demo: cargar nueva fuente
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!demo) {
      audio.pause();
      audio.removeAttribute("src");
      delete audio.dataset.demoId;
      audio.currentTime = 0;
      audio.load();
      return;
    }
    if (audio.dataset.demoId !== demo.id) {
      audio.dataset.demoId = demo.id;
      audio.src = demo.audioUrl;
      audio.load();
    }
  }, [demo]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !demo) return;
    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay bloqueado (iOS): volver el estado a pausado
        usePlayer.getState()._sync({ isPlaying: false });
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, demo]);

  // Contador de reproducciones: una vez por sesión por demo
  useEffect(() => {
    if (demo && isPlaying && isSupabasePublicConfigured()) {
      registerPlay(demo.id);
    }
  }, [demo, isPlaying]);

  // Seek pedido desde waveforms o mini-player
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && seekRequest != null && Number.isFinite(seekRequest)) {
      audio.currentTime = seekRequest;
      usePlayer.getState()._consumeSeek();
    }
  }, [seekRequest]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      className="hidden"
      onTimeUpdate={(e) =>
        usePlayer.getState()._sync({ currentTime: e.currentTarget.currentTime })
      }
      onLoadedMetadata={(e) =>
        usePlayer.getState()._sync({ duration: e.currentTarget.duration })
      }
      onEnded={() => usePlayer.getState()._sync({ isPlaying: false, currentTime: 0 })}
      onPlay={() => usePlayer.getState()._sync({ isPlaying: true })}
      onPause={() => {
        const audio = audioRef.current;
        // No marcar pausa cuando es el final natural del audio
        if (audio && !audio.ended) usePlayer.getState()._sync({ isPlaying: false });
      }}
    />
  );
}
