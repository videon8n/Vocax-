import { describe, it, expect } from 'vitest';
import { matchSongs } from '@/features/songs/matcher';
import { CATALOG } from '@/data/catalog';
import type { RangeAnalysis } from '@/features/range/range-detector';
import type { TimbreAnalysis } from '@/features/timbre/timbre-analyzer';

const userRange: RangeAnalysis = {
  lowMidi: 55,
  highMidi: 76,
  tessituraLowMidi: 60,
  tessituraHighMidi: 71,
  medianMidi: 65,
  sampleCount: 200,
  spanSemitones: 21,
};

const userTimbre: TimbreAnalysis = {
  brightness: 0.6,
  warmth: 0.5,
  breathiness: 0.3,
  roughness: 0.2,
  vibratoRateHz: null,
  vibratoExtentCents: null,
  expressiveness: 0.5,
  adjectives: ['quente', 'expressiva'],
};

describe('matchSongs', () => {
  it('returns up to "limit" matches', () => {
    const r = matchSongs({ range: userRange, timbre: userTimbre, fach: 'tenor' }, 5);
    expect(r.length).toBeLessThanOrEqual(5);
    expect(r.length).toBeGreaterThan(0);
  });

  it('filters out songs outside the user range', () => {
    // Range muito estreito (uma única nota) — quase nada deve caber
    const tinyRange: RangeAnalysis = {
      ...userRange,
      lowMidi: 60,
      highMidi: 62,
      tessituraLowMidi: 60,
      tessituraHighMidi: 62,
      medianMidi: 61,
      spanSemitones: 2,
    };
    const r = matchSongs({ range: tinyRange, timbre: userTimbre, fach: 'tenor' }, 10);
    // Nenhuma música tem extensão tão pequena → array vazio
    expect(r.length).toBe(0);
  });

  it('results are sorted by score descending', () => {
    const r = matchSongs({ range: userRange, timbre: userTimbre, fach: 'tenor' }, 10);
    for (let i = 1; i < r.length; i++) {
      expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score);
    }
  });

  it('transposition stays within the configured window', () => {
    const r = matchSongs(
      { range: userRange, timbre: userTimbre, fach: 'tenor', transposeWindow: 2 },
      10
    );
    for (const m of r) {
      expect(Math.abs(m.transpose)).toBeLessThanOrEqual(2);
    }
  });

  it('preferredGenres bumps matching songs', () => {
    const withoutPref = matchSongs(
      { range: userRange, timbre: userTimbre, fach: 'tenor' },
      30
    );
    const withPref = matchSongs(
      {
        range: userRange,
        timbre: userTimbre,
        fach: 'tenor',
        preferredGenres: ['mpb'],
      },
      30
    );
    // Some MPB song should rank higher with preference
    const mpbByScoreNoPref = withoutPref.filter((m) => m.song.genre === 'mpb').map((m) => m.score);
    const mpbByScoreWithPref = withPref.filter((m) => m.song.genre === 'mpb').map((m) => m.score);
    expect(Math.max(...mpbByScoreWithPref)).toBeGreaterThan(Math.max(...mpbByScoreNoPref));
  });

  it('rangeFit, tessituraOverlap, timbreSim are in 0..1', () => {
    const r = matchSongs({ range: userRange, timbre: userTimbre, fach: 'tenor' }, 30);
    for (const m of r) {
      expect(m.rangeFit).toBeGreaterThanOrEqual(0);
      expect(m.rangeFit).toBeLessThanOrEqual(1);
      expect(m.tessituraOverlap).toBeGreaterThanOrEqual(0);
      expect(m.tessituraOverlap).toBeLessThanOrEqual(1);
      expect(m.timbreSim).toBeGreaterThanOrEqual(-1);
      expect(m.timbreSim).toBeLessThanOrEqual(1);
    }
  });

  it('reason is a non-empty string', () => {
    const r = matchSongs({ range: userRange, timbre: userTimbre, fach: 'tenor' }, 5);
    for (const m of r) {
      expect(m.reason.length).toBeGreaterThan(0);
    }
  });

  it('catalog has at least one song that fits a typical voice', () => {
    expect(CATALOG.length).toBeGreaterThan(10);
    const r = matchSongs({ range: userRange, timbre: userTimbre, fach: 'tenor' }, 1);
    expect(r.length).toBe(1);
  });
});
