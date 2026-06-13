"use client";

import { create } from "zustand";
import type { PublicDemo } from "@/lib/types";

interface PlayerState {
  /** Demo cargado en el player global (null = mini-player oculto). */
  demo: PublicDemo | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  /** Pedido de seek pendiente (en segundos); GlobalAudio lo consume. */
  seekRequest: number | null;

  /** Carga un demo y arranca (o solo lo carga si autoplay = false). */
  play: (demo: PublicDemo, autoplay?: boolean) => void;
  toggle: () => void;
  pause: () => void;
  close: () => void;
  seek: (time: number) => void;
  /** Solo para GlobalAudio: sincroniza el estado real del <audio>. */
  _sync: (patch: Partial<Pick<PlayerState, "isPlaying" | "currentTime" | "duration">>) => void;
  _consumeSeek: () => void;
  setVolume: (volume: number) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  demo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  seekRequest: null,

  play: (demo, autoplay = true) => {
    const current = get().demo;
    if (current?.id === demo.id) {
      set({ isPlaying: autoplay ? true : get().isPlaying });
      return;
    }
    set({ demo, isPlaying: autoplay, currentTime: 0, duration: demo.durationSeconds ?? 0, seekRequest: null });
  },

  toggle: () => set((s) => (s.demo ? { isPlaying: !s.isPlaying } : s)),
  pause: () => set({ isPlaying: false }),
  close: () => set({ demo: null, isPlaying: false, currentTime: 0, duration: 0, seekRequest: null }),
  seek: (time) => set({ seekRequest: time, currentTime: time }),
  _sync: (patch) => set(patch),
  _consumeSeek: () => set({ seekRequest: null }),
  setVolume: (volume) => set({ volume }),
}));
