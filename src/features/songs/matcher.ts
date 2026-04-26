/**
 * matcher.ts — recomenda músicas baseadas no perfil vocal do usuário.
 *
 * Algoritmo:
 *   filtro_duro (range_fit) → score (chave + tessitura + timbre + dificuldade)
 *
 * Pesos default (ajustáveis):
 *   range_fit:        0.35
 *   tessitura_overlap:0.30
 *   timbre_sim:       0.20
 *   key_compat:       0.10
 *   difficulty:      -0.05
 */

import { CATALOG, type Song } from '@/data/catalog';
import type { RangeAnalysis } from '@/features/range/range-detector';
import type { TimbreAnalysis } from '@/features/timbre/timbre-analyzer';
import type { Fach } from '@/features/fach/fach-classifier';

export interface MatchInput {
  range: RangeAnalysis;
  timbre: TimbreAnalysis;
  fach: Fach;
  /** Sugestão do usuário para gênero preferido (opcional). */
  preferredGenres?: string[];
  /** Permite transposição (±semitons). */
  transposeWindow?: number;
}

export interface MatchResult {
  song: Song;
  score: number;
  /** Quão bem a extensão do usuário cobre a melodia (0..1). */
  rangeFit: number;
  /** Sobreposição de tessituras (0..1). */
  tessituraOverlap: number;
  /** Similaridade de timbre (0..1). */
  timbreSim: number;
  /** Transposição sugerida em semitons (positivo = subir). */
  transpose: number;
  /** Razão humana ("cabe na sua voz porque..."). */
  reason: string;
}

const SAFETY_MARGIN_SEMITONES = 1;

export function matchSongs(input: MatchInput, limit = 10): MatchResult[] {
  const window = input.transposeWindow ?? 3;
  const results: MatchResult[] = [];

  for (const song of CATALOG) {
    let bestTranspose = 0;
    let bestScore = -Infinity;
    let bestRangeFit = 0;
    let bestTessOverlap = 0;
    let bestTimbreSim = 0;

    // Tenta cada transposição dentro da janela
    for (let t = -window; t <= window; t++) {
      const lo = song.melodyLowMidi + t;
      const hi = song.melodyHighMidi + t;
      // Filtro duro: melodia precisa caber na extensão (com margem)
      if (lo < input.range.lowMidi - SAFETY_MARGIN_SEMITONES) continue;
      if (hi > input.range.highMidi - SAFETY_MARGIN_SEMITONES) continue;

      const rf = rangeFit(input.range, lo, hi);
      const to = tessituraOverlap(
        input.range.tessituraLowMidi,
        input.range.tessituraHighMidi,
        song.tessituraLowMidi + t,
        song.tessituraHighMidi + t
      );
      const ts = timbreSim(input.timbre, song);
      const kc = t === 0 ? 1 : 1 - Math.abs(t) / window * 0.4; // penaliza transposição
      const dp = (song.difficulty - 1) / 4; // 0..1

      let score = rf * 0.35 + to * 0.30 + ts * 0.20 + kc * 0.10 - dp * 0.05;

      // Bonus por gênero preferido
      if (input.preferredGenres?.includes(song.genre)) score += 0.05;

      if (score > bestScore) {
        bestScore = score;
        bestTranspose = t;
        bestRangeFit = rf;
        bestTessOverlap = to;
        bestTimbreSim = ts;
      }
    }

    if (bestScore > -Infinity) {
      results.push({
        song,
        score: bestScore,
        rangeFit: bestRangeFit,
        tessituraOverlap: bestTessOverlap,
        timbreSim: bestTimbreSim,
        transpose: bestTranspose,
        reason: explain(bestRangeFit, bestTessOverlap, bestTimbreSim, bestTranspose),
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function rangeFit(user: RangeAnalysis, melodyLow: number, melodyHigh: number): number {
  const span = melodyHigh - melodyLow;
  if (span <= 0) return 0;
  const userSpan = user.highMidi - user.lowMidi;
  if (userSpan <= 0) return 0;
  // quanto mais "centralizada" a melodia na extensão do usuário, melhor
  const userCenter = (user.lowMidi + user.highMidi) / 2;
  const songCenter = (melodyLow + melodyHigh) / 2;
  const offset = Math.abs(userCenter - songCenter);
  const centerScore = Math.max(0, 1 - offset / 12);
  // span ratio: quanto mais cabe, melhor (até 1)
  const fillRatio = Math.min(1, userSpan / span);
  return centerScore * 0.6 + fillRatio * 0.4;
}

function tessituraOverlap(uLo: number, uHi: number, sLo: number, sHi: number): number {
  const overlap = Math.max(0, Math.min(uHi, sHi) - Math.max(uLo, sLo));
  const union = Math.max(uHi, sHi) - Math.min(uLo, sLo);
  if (union <= 0) return 0;
  return overlap / union;
}

function timbreSim(timbre: TimbreAnalysis, song: Song): number {
  // Mapeia tags da música para um vetor [warm, bright, breathy, expressive]
  const songVec = {
    warm: song.timbreTags.includes('quente') || song.timbreTags.includes('aveludada') ? 1 : 0,
    bright: song.timbreTags.includes('brilhante') ? 1 : 0,
    breathy: song.timbreTags.includes('soprosa') ? 1 : 0,
    expressive: song.timbreTags.includes('expressiva') ? 1 : 0,
  };
  const userVec = {
    warm: timbre.warmth,
    bright: timbre.brightness,
    breathy: timbre.breathiness,
    expressive: timbre.expressiveness,
  };
  // Cosseno
  const dot =
    songVec.warm * userVec.warm +
    songVec.bright * userVec.bright +
    songVec.breathy * userVec.breathy +
    songVec.expressive * userVec.expressive;
  const magS = Math.sqrt(songVec.warm ** 2 + songVec.bright ** 2 + songVec.breathy ** 2 + songVec.expressive ** 2);
  const magU = Math.sqrt(userVec.warm ** 2 + userVec.bright ** 2 + userVec.breathy ** 2 + userVec.expressive ** 2);
  if (magS === 0 || magU === 0) return 0.5; // neutro
  return dot / (magS * magU);
}

function explain(rf: number, to: number, ts: number, transpose: number): string {
  const parts: string[] = [];
  if (rf > 0.75) parts.push('a melodia se encaixa perfeitamente na sua extensão');
  else if (rf > 0.55) parts.push('a melodia cabe na sua extensão');
  if (to > 0.5) parts.push('mora na sua zona confortável');
  if (ts > 0.7) parts.push('tem o mesmo timbre da sua voz');
  if (transpose !== 0) {
    const dir = transpose > 0 ? 'para cima' : 'para baixo';
    parts.push(`com ${Math.abs(transpose)} semitom${Math.abs(transpose) > 1 ? 's' : ''} ${dir}`);
  }
  if (parts.length === 0) return 'um bom desafio para a sua voz';
  return parts.join(', ');
}
