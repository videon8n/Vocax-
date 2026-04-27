import { describe, it, expect } from 'vitest';
import { analyzeTimbre } from '@/features/timbre/timbre-analyzer';
import type { PitchSample } from '@/audio/pitch-stream';
import type { RangeAnalysis } from '@/features/range/range-detector';
import { midiToFreq } from '@/lib/music';

function makeSample(opts: Partial<PitchSample> & { midi?: number }): PitchSample {
  const hz = opts.midi !== undefined ? midiToFreq(opts.midi) : opts.hz ?? midiToFreq(60);
  return {
    hz,
    confidence: opts.confidence ?? 0.85,
    rms: opts.rms ?? 0.05,
    centroid: opts.centroid ?? 2000,
    timestamp: opts.timestamp ?? 0,
  };
}

const baseRange: RangeAnalysis = {
  lowMidi: 50,
  highMidi: 70,
  tessituraLowMidi: 55,
  tessituraHighMidi: 65,
  medianMidi: 60,
  sampleCount: 200,
  spanSemitones: 20,
};

describe('analyzeTimbre', () => {
  it('returns up to 3 adjectives', () => {
    const samples = Array.from({ length: 100 }, () => makeSample({ midi: 60 }));
    const t = analyzeTimbre(samples, baseRange);
    expect(t.adjectives.length).toBeGreaterThan(0);
    expect(t.adjectives.length).toBeLessThanOrEqual(3);
  });

  it('falls back to "equilibrada" if no adjective scores high enough', () => {
    // mínimo 60 amostras com pouco sinal e centróide baixo
    const samples: PitchSample[] = [];
    for (let i = 0; i < 60; i++) {
      samples.push(makeSample({ midi: 60, centroid: 100, rms: 0.005, confidence: 0.65 }));
    }
    const t = analyzeTimbre(samples, baseRange);
    expect(t.adjectives.length).toBeGreaterThan(0);
  });

  it('higher centroid increases brightness score', () => {
    const dim: PitchSample[] = Array.from({ length: 80 }, () =>
      makeSample({ midi: 60, centroid: 800 })
    );
    const bright: PitchSample[] = Array.from({ length: 80 }, () =>
      makeSample({ midi: 60, centroid: 5500 })
    );
    const tDim = analyzeTimbre(dim, baseRange);
    const tBright = analyzeTimbre(bright, baseRange);
    expect(tBright.brightness).toBeGreaterThan(tDim.brightness);
  });

  it('avoids redundant pair (quente + aveludada)', () => {
    const samples = Array.from({ length: 100 }, () =>
      makeSample({ midi: 60, centroid: 800, rms: 0.08 })
    );
    const t = analyzeTimbre(samples, baseRange);
    const hasBoth = t.adjectives.includes('quente') && t.adjectives.includes('aveludada');
    expect(hasBoth).toBe(false);
  });

  it('all scores in 0..1 range', () => {
    const samples = Array.from({ length: 100 }, () => makeSample({ midi: 60 }));
    const t = analyzeTimbre(samples, baseRange);
    for (const v of [t.brightness, t.warmth, t.breathiness, t.roughness, t.expressiveness]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('vibrato detection requires sustained oscillation', () => {
    // Sem oscilação: nota travada
    const flat = Array.from({ length: 200 }, (_, i) =>
      makeSample({ midi: 60, timestamp: i * 23 })
    );
    const t = analyzeTimbre(flat, baseRange);
    expect(t.vibratoRateHz).toBeNull();
  });

  it('handles empty samples without throwing', () => {
    expect(() => analyzeTimbre([], null)).not.toThrow();
  });
});
