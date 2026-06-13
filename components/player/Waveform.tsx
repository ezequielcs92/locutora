"use client";

import { useEffect, useRef, useState } from "react";
import type WaveSurfer from "wavesurfer.js";

interface WaveformProps {
  url: string;
  /** Si el demo de este waveform es el que está cargado en el player global. */
  isActive: boolean;
  currentTime: number;
  onSeek: (time: number) => void;
  height?: number;
}

/**
 * Waveform de visualización/seek. NUNCA reproduce audio: el playback
 * vive en GlobalAudio y acá solo se refleja el progreso.
 */
export default function Waveform({ url, isActive, currentTime, onSeek, height = 48 }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let instance: WaveSurfer | null = null;

    async function init() {
      if (!containerRef.current) return;
      const { default: WS } = await import("wavesurfer.js");
      if (cancelled || !containerRef.current) return;

      instance = WS.create({
        container: containerRef.current,
        url,
        height,
        waveColor: "rgba(244, 237, 227, 0.22)",
        progressColor: "#d9a154",
        cursorWidth: 0,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        normalize: true,
        interact: true,
        dragToSeek: false,
        // Nunca reproducir desde acá:
        autoplay: false,
      });
      wavesurferRef.current = instance;

      instance.on("ready", () => {
        if (!cancelled) setReady(true);
      });
      // Click en el waveform → seek en el player global
      instance.on("interaction", (newTime: number) => {
        onSeekRef.current(newTime);
      });
    }

    void init();

    return () => {
      cancelled = true;
      setReady(false);
      try {
        instance?.destroy();
      } catch {
        // wavesurfer puede tirar AbortError al destruir mientras carga
      }
      wavesurferRef.current = null;
    };
  }, [url, height]);

  // Espejar el progreso del player global
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !ready) return;
    try {
      ws.setTime(isActive ? currentTime : 0);
    } catch {
      // ignorar si el audio aún no decodificó
    }
  }, [currentTime, isActive, ready]);

  return (
    <div className="relative w-full" style={{ height }}>
      {!ready && (
        <div
          aria-hidden
          className="absolute inset-0 flex items-end justify-between gap-0.5 overflow-hidden"
        >
          {Array.from({ length: 64 }).map((_, i) => (
            <span
              key={i}
              className="w-0.5 animate-pulse rounded-full bg-cream/10"
              style={{ height: `${(20 + Math.abs(Math.sin(i * 2.7)) * 70).toFixed(4)}%` }}
            />
          ))}
        </div>
      )}
      <div ref={containerRef} className={ready ? "opacity-100" : "opacity-0"} />
    </div>
  );
}
