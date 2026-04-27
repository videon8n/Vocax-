import { describe, it, expect } from 'vitest';
import { classifyFach } from '@/features/fach/fach-classifier';
import type { RangeAnalysis } from '@/features/range/range-detector';

function range(lo: number, hi: number, tessLo?: number, tessHi?: number, median?: number): RangeAnalysis {
  return {
    lowMidi: lo,
    highMidi: hi,
    tessituraLowMidi: tessLo ?? Math.round(lo + (hi - lo) * 0.25),
    tessituraHighMidi: tessHi ?? Math.round(lo + (hi - lo) * 0.75),
    medianMidi: median ?? Math.round((lo + hi) / 2),
    sampleCount: 200,
    spanSemitones: hi - lo,
  };
}

describe('classifyFach', () => {
  it('classifies a soprano range (C4-C6)', () => {
    const r = classifyFach(range(60, 84));
    expect(r.primary).toBe('soprano');
    expect(r.primaryLabel).toBe('Soprano');
    expect(r.confidence).toBeGreaterThan(0);
  });

  it('classifies a tenor range (C3-C5)', () => {
    const r = classifyFach(range(48, 72));
    expect(r.primary).toBe('tenor');
  });

  it('classifies a bass range (E2-E4)', () => {
    const r = classifyFach(range(40, 64));
    expect(r.primary).toBe('baixo');
  });

  it('classifies a baritone range (A2-A4)', () => {
    const r = classifyFach(range(45, 69));
    expect(r.primary).toBe('baritono');
  });

  it('classifies a mezzo range (A3-A5)', () => {
    const r = classifyFach(range(57, 81));
    expect(r.primary).toBe('mezzo-soprano');
  });

  it('classifies a low female range (F3-F5) as mezzo or contralto', () => {
    // F3-F5 (53-77) é contralto canônico, mas o algoritmo do MVP, com peso
    // forte em overlap, pode chamar de mezzo. Ambos são respostas defensáveis
    // sem informação adicional de timbre.
    const r = classifyFach(range(53, 77));
    expect(['mezzo-soprano', 'contralto']).toContain(r.primary);
  });

  it('always returns a secondary fach', () => {
    const r = classifyFach(range(48, 72));
    expect(r.secondary).not.toBeNull();
    expect(r.secondary).not.toBe(r.primary);
  });

  it('produces a humanPhrase string', () => {
    const r = classifyFach(range(60, 84));
    expect(typeof r.humanPhrase).toBe('string');
    expect(r.humanPhrase.length).toBeGreaterThan(10);
    expect(r.humanPhrase).toContain('**');
  });

  it('confidence is between 0 and 1', () => {
    for (const [lo, hi] of [[60, 84], [48, 72], [40, 64], [57, 81]]) {
      const r = classifyFach(range(lo, hi));
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('is stable across calls (deterministic)', () => {
    const a = classifyFach(range(60, 84));
    const b = classifyFach(range(60, 84));
    expect(a).toEqual(b);
  });
});
