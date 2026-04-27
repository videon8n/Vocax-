/**
 * Formatadores de UI: plurais, números e datas em PT-BR.
 *
 * Plural simples: forma pt-BR padrão é "1 X" / "n Xs".
 * Para casos especiais (irregulares), passar both forms.
 */

export function pluralPt(n: number, singular: string, plural?: string): string {
  const word = Math.abs(n) === 1 ? singular : plural ?? `${singular}s`;
  return `${n} ${word}`;
}

/** Formata semitones com plural. */
export function formatSemitones(n: number): string {
  return pluralPt(n, 'semitom', 'semitons');
}

/** Formata duração em segundos como "Ns" arredondado. */
export function formatSeconds(s: number): string {
  return `${s.toFixed(0)}s`;
}

/** Formata número de amostras com plural. */
export function formatSamples(n: number): string {
  return pluralPt(n, 'amostra', 'amostras');
}
