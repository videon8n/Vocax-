/**
 * Conversões e nomenclatura musical.
 * MIDI 69 = A4 = 440 Hz é o âncora.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const NOTE_NAMES_PT = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'] as const;

export function freqToMidi(hz: number): number {
  if (hz <= 0) return NaN;
  return 69 + 12 * Math.log2(hz / 440);
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqToCents(hz: number, refHz: number): number {
  return 1200 * Math.log2(hz / refHz);
}

export function midiToNoteName(midi: number, lang: 'en' | 'pt' = 'en'): string {
  const rounded = Math.round(midi);
  if (!Number.isFinite(rounded)) return '—';
  const names = lang === 'pt' ? NOTE_NAMES_PT : NOTE_NAMES;
  const note = names[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${note}${octave}`;
}

export function midiToNoteParts(midi: number, lang: 'en' | 'pt' = 'en') {
  const rounded = Math.round(midi);
  const names = lang === 'pt' ? NOTE_NAMES_PT : NOTE_NAMES;
  return {
    name: names[((rounded % 12) + 12) % 12],
    octave: Math.floor(rounded / 12) - 1,
  };
}

/** Distância em semitons entre duas frequências. */
export function semitoneDistance(hz1: number, hz2: number): number {
  return 12 * Math.log2(hz2 / hz1);
}

/** Encontra a chave musical (Camelot wheel) para nota e modo. */
const CAMELOT_MAJOR = ['8B', '3B', '10B', '5B', '12B', '7B', '2B', '9B', '4B', '11B', '6B', '1B'];
const CAMELOT_MINOR = ['5A', '12A', '7A', '2A', '9A', '4A', '11A', '6A', '1A', '8A', '3A', '10A'];

export function camelotKey(rootMidi: number, mode: 'major' | 'minor'): string {
  const idx = ((Math.round(rootMidi) % 12) + 12) % 12;
  return mode === 'major' ? CAMELOT_MAJOR[idx] : CAMELOT_MINOR[idx];
}
