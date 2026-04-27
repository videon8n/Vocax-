import { describe, it, expect } from 'vitest';
import { analyzeRange } from '@/features/range/range-detector';
import type { PitchSample } from '@/audio/pitch-stream';
import { midiToFreq } from '@/lib/music';

function sampleAt(midi: number, confidence = 0.8, rms = 0.05): PitchSample {
  return {
    hz: midiToFreq(midi),
    confidence,
    rms,
    centroid: 2000,
    timestamp: 0,
  };
}

describe('analyzeRange', () => {
  it('returns null when fewer than 30 valid samples', () => {
    const samples = Array.from({ length: 20 }, () => sampleAt(60));
    expect(analyzeRange(samples)).toBeNull();
  });

  it('returns null when all samples are below confidence threshold', () => {
    const samples = Array.from({ length: 100 }, () => sampleAt(60, 0.1));
    expect(analyzeRange(samples)).toBeNull();
  });

  it('returns null when RMS is too low', () => {
    const samples = Array.from({ length: 100 }, () => sampleAt(60, 0.9, 0.001));
    expect(analyzeRange(samples)).toBeNull();
  });

  it('computes percentiles correctly for a uniform range', () => {
    // Distribui 100 amostras de C3 (48) a C5 (72) — 25 semitons
    const samples: PitchSample[] = [];
    for (let m = 48; m <= 72; m++) {
      for (let i = 0; i < 4; i++) samples.push(sampleAt(m));
    }
    const r = analyzeRange(samples);
    expect(r).not.toBeNull();
    expect(r!.lowMidi).toBeGreaterThanOrEqual(48);
    expect(r!.highMidi).toBeLessThanOrEqual(72);
    expect(r!.medianMidi).toBeCloseTo(60, 0);
    expect(r!.spanSemitones).toBeGreaterThan(15);
  });

  it('rejects MIDI values outside the sanity window (30..90)', () => {
    // Mistura: notas válidas ao redor de C4 + outliers extremos
    const samples: PitchSample[] = [];
    for (let i = 0; i < 60; i++) samples.push(sampleAt(60));
    // Outliers: 5 amostras impossíveis (MIDI 5 e 120)
    for (let i = 0; i < 5; i++) {
      samples.push({
        hz: midiToFreq(5),
        confidence: 0.9,
        rms: 0.05,
        centroid: 2000,
        timestamp: 0,
      });
      samples.push({
        hz: midiToFreq(120),
        confidence: 0.9,
        rms: 0.05,
        centroid: 2000,
        timestamp: 0,
      });
    }
    const r = analyzeRange(samples);
    expect(r).not.toBeNull();
    // Outliers devem ter sido descartados
    expect(r!.lowMidi).toBeGreaterThanOrEqual(30);
    expect(r!.highMidi).toBeLessThanOrEqual(90);
  });

  it('tessitura (P25-P75) is narrower than full range', () => {
    const samples: PitchSample[] = [];
    for (let m = 50; m <= 70; m++) {
      for (let i = 0; i < 5; i++) samples.push(sampleAt(m));
    }
    const r = analyzeRange(samples)!;
    expect(r.tessituraLowMidi).toBeGreaterThanOrEqual(r.lowMidi);
    expect(r.tessituraHighMidi).toBeLessThanOrEqual(r.highMidi);
    expect(r.tessituraHighMidi - r.tessituraLowMidi).toBeLessThan(r.spanSemitones);
  });

  it('ignores samples with hz=null', () => {
    const samples: PitchSample[] = [];
    for (let i = 0; i < 50; i++) samples.push(sampleAt(60));
    for (let i = 0; i < 50; i++) {
      samples.push({ hz: null, confidence: 0.9, rms: 0.05, centroid: 0, timestamp: 0 });
    }
    const r = analyzeRange(samples);
    expect(r).not.toBeNull();
    expect(r!.sampleCount).toBe(50);
  });
});
