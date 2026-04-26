/**
 * fach-classifier.ts — classificação de fach (tipo de voz) baseada em
 * extensão vocal e zona central.
 *
 * Baseado em referências pedagógicas tradicionais (Coffin, Miller).
 * Saída sempre é "sua voz se aproxima de X" — nunca um veredito definitivo.
 *
 * Faixas centrais aproximadas (MIDI):
 *   Soprano:    C4 (60) – C6 (84)
 *   Mezzo:      A3 (57) – A5 (81)
 *   Contralto:  F3 (53) – F5 (77)
 *   Tenor:      C3 (48) – C5 (72)
 *   Barítono:   A2 (45) – A4 (69)
 *   Baixo:      E2 (40) – E4 (64)
 */

import type { RangeAnalysis } from '@/features/range/range-detector';

export type Fach =
  | 'soprano'
  | 'mezzo-soprano'
  | 'contralto'
  | 'tenor'
  | 'baritono'
  | 'baixo';

const FACH_PROFILES: Record<Fach, { lo: number; hi: number; centerLo: number; centerHi: number; labelPt: string; labelEn: string }> = {
  soprano: { lo: 60, hi: 84, centerLo: 64, centerHi: 79, labelPt: 'Soprano', labelEn: 'Soprano' },
  'mezzo-soprano': { lo: 57, hi: 81, centerLo: 60, centerHi: 76, labelPt: 'Mezzo-soprano', labelEn: 'Mezzo-soprano' },
  contralto: { lo: 53, hi: 77, centerLo: 57, centerHi: 72, labelPt: 'Contralto', labelEn: 'Contralto' },
  tenor: { lo: 48, hi: 72, centerLo: 52, centerHi: 67, labelPt: 'Tenor', labelEn: 'Tenor' },
  baritono: { lo: 45, hi: 69, centerLo: 48, centerHi: 64, labelPt: 'Barítono', labelEn: 'Baritone' },
  baixo: { lo: 40, hi: 64, centerLo: 43, centerHi: 60, labelPt: 'Baixo', labelEn: 'Bass' },
};

export interface FachResult {
  primary: Fach;
  primaryLabel: string;
  secondary: Fach | null;
  confidence: number;
  /** Frase humana pronta para UI. */
  humanPhrase: string;
}

export function classifyFach(range: RangeAnalysis): FachResult {
  const candidates: { fach: Fach; score: number }[] = [];

  for (const [key, p] of Object.entries(FACH_PROFILES)) {
    const fach = key as Fach;
    // Sobreposição da extensão do usuário com a faixa central do fach
    const overlap = Math.max(
      0,
      Math.min(range.highMidi, p.centerHi) - Math.max(range.lowMidi, p.centerLo)
    );
    // Penaliza se a tessitura está fora da janela do fach
    const tessituraInside =
      range.tessituraLowMidi >= p.lo - 2 && range.tessituraHighMidi <= p.hi + 2;
    const tessituraScore = tessituraInside ? 1 : 0.4;
    // Distância da mediana ao centro da faixa
    const center = (p.centerLo + p.centerHi) / 2;
    const dist = Math.abs(range.medianMidi - center);
    const distScore = Math.max(0, 1 - dist / 12); // 1 oitava = 0

    const score = overlap * 0.55 + tessituraScore * 12 * 0.25 + distScore * 12 * 0.2;
    candidates.push({ fach, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];
  const second = candidates[1];
  const total = candidates.reduce((acc, c) => acc + c.score, 0);
  const confidence = total > 0 ? top.score / total : 0;

  const primaryLabel = FACH_PROFILES[top.fach].labelPt;
  const secondaryLabel = second ? FACH_PROFILES[second.fach].labelPt : '';

  const humanPhrase =
    confidence > 0.35
      ? `Sua voz se aproxima de **${primaryLabel}**, com algumas notas de ${secondaryLabel}.`
      : `Sua voz transita entre **${primaryLabel}** e **${secondaryLabel}** — uma assinatura híbrida.`;

  return {
    primary: top.fach,
    primaryLabel,
    secondary: second ? second.fach : null,
    confidence,
    humanPhrase,
  };
}
