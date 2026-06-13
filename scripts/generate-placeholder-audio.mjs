// Genera audios WAV placeholder para el modo mock (public/demos/).
// Uso: npm run gen:audio

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22050;
const DURATION = 12; // segundos
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "demos");

/** Empaqueta samples PCM float [-1,1] en un WAV 16-bit mono. */
function toWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

/** Sintetiza una secuencia de notas (arpegio) con envolvente y armónicos suaves. */
function synth(noteFreqs, { noteLength = 0.5, gain = 0.35 } = {}) {
  const total = Math.floor(SAMPLE_RATE * DURATION);
  const samples = new Float64Array(total);
  const perNote = Math.floor(SAMPLE_RATE * noteLength);

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const noteIndex = Math.floor(i / perNote) % noteFreqs.length;
    const noteT = (i % perNote) / SAMPLE_RATE;
    const freq = noteFreqs[noteIndex];

    // Envolvente de la nota: ataque rápido, caída exponencial
    const attack = Math.min(noteT / 0.02, 1);
    const decay = Math.exp(-noteT * 4);
    const env = attack * decay;

    // Fundamental + armónicos para que suene menos a "beep"
    const wave =
      Math.sin(2 * Math.PI * freq * t) * 0.7 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.2 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.1;

    // Fade in/out global
    const fade = Math.min(t / 0.4, 1, (DURATION - t) / 0.8);

    samples[i] = wave * env * fade * gain;
  }
  return samples;
}

// Escalas distintas para que cada "demo" suene diferente
const FILES = {
  "demo-comercial-1.wav": [392, 494, 587, 784, 587, 494], // Sol mayor, vivo
  "demo-comercial-2.wav": [330, 415, 494, 659, 494, 415], // Mi mayor
  "demo-institucional.wav": [262, 330, 392, 523, 392, 330], // Do mayor, sobrio
  "demo-ivr.wav": [349, 440, 523, 440], // Fa, simple
  "demo-elearning.wav": [294, 370, 440, 587, 440, 370], // Re mayor, calmo
  "demo-doblaje.wav": [220, 277, 330, 440, 330, 277], // La menor, narrativo
};

mkdirSync(OUT_DIR, { recursive: true });

for (const [name, notes] of Object.entries(FILES)) {
  const noteLength = name.includes("ivr") ? 0.8 : 0.55;
  writeFileSync(join(OUT_DIR, name), toWav(synth(notes, { noteLength })));
  console.log(`✓ ${name}`);
}

console.log(`\nListo: ${Object.keys(FILES).length} audios en public/demos/`);
