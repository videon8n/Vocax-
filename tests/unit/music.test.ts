import { describe, it, expect } from 'vitest';
import {
  freqToMidi,
  midiToFreq,
  midiToNoteName,
  midiToNoteParts,
  freqToCents,
  semitoneDistance,
  camelotKey,
} from '@/lib/music';

describe('lib/music', () => {
  describe('freqToMidi / midiToFreq', () => {
    it('A4 (440 Hz) maps to MIDI 69', () => {
      expect(freqToMidi(440)).toBeCloseTo(69, 5);
      expect(midiToFreq(69)).toBeCloseTo(440, 5);
    });

    it('round-trips across octaves', () => {
      for (const m of [21, 60, 72, 84, 96, 108]) {
        expect(freqToMidi(midiToFreq(m))).toBeCloseTo(m, 5);
      }
    });

    it('returns NaN for non-positive Hz', () => {
      expect(freqToMidi(0)).toBeNaN();
      expect(freqToMidi(-100)).toBeNaN();
    });
  });

  describe('midiToNoteName', () => {
    it('formats common notes in English', () => {
      expect(midiToNoteName(60)).toBe('C4');
      expect(midiToNoteName(69)).toBe('A4');
      expect(midiToNoteName(72)).toBe('C5');
    });

    it('formats sharps in English', () => {
      expect(midiToNoteName(61)).toBe('C#4');
      expect(midiToNoteName(70)).toBe('A#4');
    });

    it('handles Portuguese with accented note names', () => {
      expect(midiToNoteName(60, 'pt')).toBe('Dó4');
      expect(midiToNoteName(69, 'pt')).toBe('Lá4');
    });

    it('returns dash for non-finite input', () => {
      expect(midiToNoteName(Number.NaN)).toBe('—');
      expect(midiToNoteName(Number.POSITIVE_INFINITY)).toBe('—');
    });
  });

  describe('midiToNoteParts', () => {
    it('splits name and octave', () => {
      expect(midiToNoteParts(60)).toEqual({ name: 'C', octave: 4 });
      expect(midiToNoteParts(48, 'pt')).toEqual({ name: 'Dó', octave: 3 });
    });
  });

  describe('freqToCents / semitoneDistance', () => {
    it('octave above is +1200 cents', () => {
      expect(freqToCents(880, 440)).toBeCloseTo(1200, 5);
    });

    it('octave above is 12 semitones', () => {
      expect(semitoneDistance(440, 880)).toBeCloseTo(12, 5);
    });
  });

  describe('camelotKey', () => {
    it('returns valid Camelot codes for major and minor', () => {
      const major = camelotKey(60, 'major'); // C major
      const minor = camelotKey(60, 'minor'); // C minor
      expect(major).toMatch(/^\d+B$/);
      expect(minor).toMatch(/^\d+A$/);
    });
  });
});
