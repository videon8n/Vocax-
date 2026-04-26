/**
 * timbre-analyzer.ts — extrai descritores de timbre a partir de
 * amostras de pitch + centróide espectral + RMS.
 *
 * Heurísticas (não modelo ML — MVP):
 *  - centróide alto + RMS médio       → "brilhante"
 *  - centróide baixo + RMS alto       → "quente / aveludada"
 *  - RMS instável                     → "soprosa / arejada"
 *  - confiança baixa frequente        → "rouca / texturizada"
 *  - vibrato detectável (osc 4-7Hz)   → "com vibrato natural"
 *  - grande variação de pitch         → "expressiva"
 */

import type { PitchSample } from '@/audio/pitch-stream';
import type { RangeAnalysis } from '@/features/range/range-detector';
import { freqToMidi } from '@/lib/music';

export interface TimbreAnalysis {
  brightness: number;       // 0..1
  warmth: number;           // 0..1 (oposto de brightness mas ponderado por RMS)
  breathiness: number;      // 0..1 (instabilidade de RMS)
  roughness: number;        // 0..1 (frequência de baixa confiança em frames vozeados)
  vibratoRateHz: number | null;
  vibratoExtentCents: number | null;
  expressiveness: number;   // 0..1 (variabilidade de pitch)
  adjectives: string[];     // até 3, ordenados por intensidade
}

export function analyzeTimbre(
  samples: PitchSample[],
  range: RangeAnalysis | null
): TimbreAnalysis {
  // Filtra frames com voz
  const voiced = samples.filter((s) => s.hz !== null && s.confidence > 0.4);
  const all = samples.filter((s) => s.rms > 0.005);

  const centroids = voiced.map((s) => s.centroid);
  const rmsValues = voiced.map((s) => s.rms);
  const meanCentroid = mean(centroids) || 0;
  const meanRms = mean(rmsValues) || 0;
  const stdRms = std(rmsValues) || 0;
  const cvRms = meanRms > 0 ? stdRms / meanRms : 0; // coef. variação

  // Brilho: centróide normalizado (0..6kHz como referência)
  const brightness = clamp01(meanCentroid / 6000);

  // Calor: combinação de centróide baixo + RMS sustentado
  const warmth = clamp01((1 - brightness) * 0.7 + clamp01(meanRms * 12) * 0.3);

  // Aspiração / sopro: alta variabilidade de RMS quando vozeado
  const breathiness = clamp01(cvRms * 1.3);

  // Aspereza: razão de frames com voz porém baixa confiança
  const lowConf = all.filter((s) => s.hz !== null && s.confidence < 0.6).length;
  const roughness = all.length > 0 ? clamp01((lowConf / all.length) * 1.4) : 0;

  // Vibrato: detecta oscilação 4-7 Hz na trajetória de pitch
  const vib = detectVibrato(voiced);

  // Expressividade: faixa interquartil ÷ extensão total
  const expressiveness = range && range.spanSemitones > 0
    ? clamp01((range.tessituraHighMidi - range.tessituraLowMidi) / range.spanSemitones * 1.4)
    : 0.4;

  const adjectives = buildAdjectives({
    brightness,
    warmth,
    breathiness,
    roughness,
    vibrato: vib.rateHz !== null,
    expressiveness,
  });

  return {
    brightness,
    warmth,
    breathiness,
    roughness,
    vibratoRateHz: vib.rateHz,
    vibratoExtentCents: vib.extentCents,
    expressiveness,
    adjectives,
  };
}

function buildAdjectives(scores: {
  brightness: number;
  warmth: number;
  breathiness: number;
  roughness: number;
  vibrato: boolean;
  expressiveness: number;
}): string[] {
  const candidates: { word: string; intensity: number }[] = [
    { word: 'brilhante', intensity: scores.brightness },
    { word: 'quente', intensity: scores.warmth },
    { word: 'aveludada', intensity: scores.warmth * 0.85 },
    { word: 'soprosa', intensity: scores.breathiness },
    { word: 'arejada', intensity: scores.breathiness * 0.7 },
    { word: 'texturizada', intensity: scores.roughness },
    { word: 'com vibrato natural', intensity: scores.vibrato ? 0.85 : 0 },
    { word: 'expressiva', intensity: scores.expressiveness },
    { word: 'estável', intensity: clamp01(1 - scores.breathiness - scores.roughness * 0.5) },
  ];
  // ordena por intensidade, dedup por similaridade, pega top 3
  candidates.sort((a, b) => b.intensity - a.intensity);
  const picked: string[] = [];
  for (const c of candidates) {
    if (c.intensity < 0.35) continue;
    if (picked.length >= 3) break;
    // evita "quente" e "aveludada" juntas
    if (
      (c.word === 'aveludada' && picked.includes('quente')) ||
      (c.word === 'arejada' && picked.includes('soprosa'))
    ) continue;
    picked.push(c.word);
  }
  if (picked.length === 0) picked.push('equilibrada');
  return picked;
}

function detectVibrato(samples: PitchSample[]): { rateHz: number | null; extentCents: number | null } {
  if (samples.length < 60) return { rateHz: null, extentCents: null };
  // Constrói série temporal de cents relativos à mediana
  const midi = samples.map((s) => freqToMidi(s.hz as number));
  const med = median(midi);
  const cents = midi.map((m) => (m - med) * 100);

  // Conta inversões de derivada para estimar frequência da oscilação
  let signChanges = 0;
  for (let i = 2; i < cents.length; i++) {
    const d1 = cents[i - 1] - cents[i - 2];
    const d2 = cents[i] - cents[i - 1];
    if (d1 * d2 < 0 && Math.abs(cents[i] - cents[i - 1]) > 5) signChanges++;
  }
  const durationSec = (samples[samples.length - 1].timestamp - samples[0].timestamp) / 1000;
  if (durationSec <= 0) return { rateHz: null, extentCents: null };
  const rateHz = signChanges / 2 / durationSec;
  const extent = (max(cents) - min(cents)) / 2;

  if (rateHz < 3.5 || rateHz > 8 || extent < 20) return { rateHz: null, extentCents: null };
  return { rateHz: round(rateHz, 1), extentCents: Math.round(extent) };
}

// utilidades
function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function std(xs: number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}
function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
}
function max(xs: number[]): number {
  return xs.reduce((a, b) => (a > b ? a : b), -Infinity);
}
function min(xs: number[]): number {
  return xs.reduce((a, b) => (a < b ? a : b), Infinity);
}
function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
function round(x: number, digits = 0): number {
  const f = Math.pow(10, digits);
  return Math.round(x * f) / f;
}
