/**
 * range-detector.ts — extrai a extensão vocal confiável de uma sequência
 * de amostras de pitch.
 *
 * Estratégia:
 *  - filtra por confiança e RMS
 *  - converte para MIDI
 *  - calcula percentis 3 e 97 para evitar squeaks/grunts pontuais
 *  - tessitura = percentis 25-75 (zona confortável)
 */

import { freqToMidi } from '@/lib/music';
import type { PitchSample } from '@/audio/pitch-stream';

const MIN_CONFIDENCE = 0.55;
const MIN_RMS = 0.01;

export interface RangeAnalysis {
  /** MIDI da nota mais grave confiável (percentil 3). */
  lowMidi: number;
  /** MIDI da nota mais aguda confiável (percentil 97). */
  highMidi: number;
  /** Tessitura confortável: [percentil 25, percentil 75]. */
  tessituraLowMidi: number;
  tessituraHighMidi: number;
  /** Mediana = nota "central" da voz. */
  medianMidi: number;
  /** Total de amostras válidas usadas. */
  sampleCount: number;
  /** Extensão em semitons. */
  spanSemitones: number;
}

export function analyzeRange(samples: PitchSample[]): RangeAnalysis | null {
  const midi: number[] = [];
  for (const s of samples) {
    if (s.hz && s.confidence >= MIN_CONFIDENCE && s.rms >= MIN_RMS) {
      const m = freqToMidi(s.hz);
      if (m >= 30 && m <= 90) midi.push(m); // sanity (~G1 a F#6)
    }
  }
  if (midi.length < 30) return null;
  midi.sort((a, b) => a - b);

  const pct = (p: number) => midi[Math.min(midi.length - 1, Math.floor((p / 100) * midi.length))];
  const lowMidi = pct(3);
  const highMidi = pct(97);
  const tessituraLowMidi = pct(25);
  const tessituraHighMidi = pct(75);
  const medianMidi = pct(50);

  return {
    lowMidi,
    highMidi,
    tessituraLowMidi,
    tessituraHighMidi,
    medianMidi,
    sampleCount: midi.length,
    spanSemitones: highMidi - lowMidi,
  };
}
