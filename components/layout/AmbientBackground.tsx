"use client";

import { motion, useReducedMotion } from "motion/react";

const RADIO_WAVES = [
  {
    d: "M -80 150 C 120 92 240 210 420 150 S 730 96 910 154 S 1210 214 1520 138",
    width: 1.8,
    opacity: 0.42,
    duration: 18,
    delay: 0,
  },
  {
    d: "M -80 235 C 85 292 260 178 420 232 S 710 302 900 232 S 1205 164 1520 244",
    width: 1.3,
    opacity: 0.34,
    duration: 22,
    delay: 2.2,
  },
  {
    d: "M -80 338 C 130 262 245 414 440 338 S 720 258 930 342 S 1210 430 1520 326",
    width: 1.7,
    opacity: 0.4,
    duration: 20,
    delay: 1.1,
  },
  {
    d: "M -80 470 C 110 536 270 392 450 466 S 745 550 930 468 S 1212 390 1520 482",
    width: 1.3,
    opacity: 0.3,
    duration: 24,
    delay: 3.4,
  },
  {
    d: "M -80 612 C 120 542 260 698 470 612 S 760 528 960 616 S 1220 710 1520 596",
    width: 1.5,
    opacity: 0.36,
    duration: 21,
    delay: 0.8,
  },
  {
    d: "M -80 744 C 95 800 270 674 455 738 S 755 812 950 742 S 1235 660 1520 752",
    width: 1.2,
    opacity: 0.26,
    duration: 26,
    delay: 4.4,
  },
];

const BROADCAST_RINGS = [
  { r: 120, opacity: 0.32, delay: 0 },
  { r: 190, opacity: 0.26, delay: 1.4 },
  { r: 270, opacity: 0.2, delay: 2.8 },
  { r: 360, opacity: 0.15, delay: 4.2 },
];

export default function AmbientBackground() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      data-testid="ambient-background"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_52%_18%,rgb(184_131_46/0.10),transparent_44%),linear-gradient(180deg,rgb(26_23_20/0.04)_0%,rgb(26_23_20/0.12)_72%,var(--color-bg)_100%)] dark:bg-[radial-gradient(ellipse_at_52%_18%,rgba(217,161,84,0.16),transparent_44%),linear-gradient(180deg,rgba(14,12,9,0.14)_0%,rgba(14,12,9,0.44)_72%,#0e0c09_100%)]" />

      <motion.div
        className="absolute inset-0 opacity-[0.12] dark:opacity-[0.26]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 2.4rem, rgb(184 131 46 / 0.12) 2.4rem calc(2.4rem + 1px), transparent calc(2.4rem + 1px) 4.8rem)",
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
        animate={reduced ? undefined : { x: [0, -42, 0], opacity: [0.16, 0.32, 0.16] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="radio-wave-stroke" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#ecbe7a" stopOpacity="0" />
            <stop offset="14%" stopColor="#ecbe7a" stopOpacity="0.62" />
            <stop offset="50%" stopColor="#f4ede3" stopOpacity="0.28" />
            <stop offset="86%" stopColor="#d9a154" stopOpacity="0.56" />
            <stop offset="100%" stopColor="#ecbe7a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="radio-ring-stroke" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ecbe7a" stopOpacity="0.46" />
            <stop offset="100%" stopColor="#f4ede3" stopOpacity="0.12" />
          </linearGradient>
          <mask id="radio-fade-mask">
            <rect width="1440" height="900" fill="url(#radio-fade-gradient)" />
          </mask>
          <linearGradient id="radio-fade-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop offset="12%" stopColor="white" stopOpacity="0.95" />
            <stop offset="62%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.58" />
          </linearGradient>
        </defs>

        <motion.g
          mask="url(#radio-fade-mask)"
          animate={reduced ? undefined : { x: [-36, 22, -36], y: [0, -10, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        >
          {RADIO_WAVES.map((wave) => (
            <motion.path
              key={wave.d}
              d={wave.d}
              fill="none"
              stroke="url(#radio-wave-stroke)"
              strokeLinecap="round"
              strokeWidth={wave.width}
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={
                reduced
                  ? { opacity: wave.opacity }
                  : {
                      opacity: [wave.opacity * 0.5, wave.opacity, wave.opacity * 0.58],
                      pathLength: [0.58, 1, 0.62],
                      strokeDashoffset: [0, -260],
                    }
              }
              style={{ filter: "drop-shadow(0 0 6px rgba(236,190,122,0.2))", strokeDasharray: "22 24" }}
              transition={{
                delay: wave.delay,
                duration: wave.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.g>

        <g transform="translate(1080 430)">
          {BROADCAST_RINGS.map((ring) => (
            <motion.circle
              key={ring.r}
              cx="0"
              cy="0"
              r={ring.r}
              fill="none"
              stroke="url(#radio-ring-stroke)"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
              animate={
                reduced
                  ? { opacity: ring.opacity }
                  : {
                      opacity: [ring.opacity * 0.25, ring.opacity, ring.opacity * 0.2],
                      scale: [0.96, 1.08, 0.96],
                    }
              }
              transition={{
                delay: ring.delay,
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      </svg>

      <motion.div
        className="absolute inset-y-0 left-[-20%] w-[42%] skew-x-[-14deg] bg-[linear-gradient(90deg,transparent,rgb(184_131_46/0.08),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(236,190,122,0.16),transparent)]"
        animate={reduced ? undefined : { x: ["0%", "330%", "0%"], opacity: [0, 0.42, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(26 23 20 / 0.4) 1px, transparent 0)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(26_23_20/0.02)_0%,rgb(26_23_20/0.08)_55%,rgb(26_23_20/0.18)_100%)] dark:bg-[linear-gradient(180deg,rgba(14,12,9,0.08)_0%,rgba(14,12,9,0.38)_55%,rgba(14,12,9,0.88)_100%)]" />
    </div>
  );
}
