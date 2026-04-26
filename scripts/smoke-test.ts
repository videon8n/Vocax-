/**
 * smoke-test.mjs — valida toda a pipeline analítica do Vocax
 * sem precisar de microfone ou navegador.
 *
 * Simula uma voz mezzo-soprano: gera amostras de pitch sintéticas,
 * roda pelos analisadores reais (range, timbre, fach, matcher) e
 * imprime o que o usuário veria no Cartão de Voz.
 */

import { analyzeRange } from '../src/features/range/range-detector';
import { analyzeTimbre } from '../src/features/timbre/timbre-analyzer';
import { classifyFach } from '../src/features/fach/fach-classifier';
import { matchSongs } from '../src/features/songs/matcher';
import { midiToFreq, midiToNoteName } from '../src/lib/music';

// === 1. Sintetiza uma sessão de voz: mezzo-soprano (G3 a A5) ===
function synthMezzo() {
  const samples = [];
  const startMs = performance.now();
  // Sirene grave→agudo + arpejo + frase, ~3000 frames (~70s @ 23ms)
  for (let i = 0; i < 3000; i++) {
    let midi;
    if (i < 600) midi = 55 + (i / 600) * 12; // G3 → G4 (sirene grave)
    else if (i < 1200) midi = 67 + ((i - 600) / 600) * 14; // G4 → A5 (sirene aguda)
    else if (i < 2200) {
      const arp = [60, 64, 67, 72, 67, 64, 60];
      midi = arp[Math.floor((i - 1200) / 28) % arp.length];
    } else {
      // frase melódica em torno de C5 (mezzo central)
      midi = 70 + Math.sin((i - 2200) / 12) * 4;
    }
    // Vibrato natural 5.5Hz, ±25 cents, depois dos primeiros 800 frames
    if (i > 800) midi += Math.sin(i * 0.34) * 0.25;
    const hz = midiToFreq(midi);
    const confidence = 0.7 + Math.random() * 0.25;
    const rms = 0.04 + Math.random() * 0.02;
    const centroid = 2200 + Math.random() * 800; // mezzo brilho médio-alto
    samples.push({
      hz,
      confidence,
      rms,
      centroid,
      timestamp: startMs + i * 23,
    });
  }
  return samples;
}

// === 2. Pipeline completa ===
const samples = synthMezzo();
console.log(`▸ Geradas ${samples.length} amostras de voz sintética (mezzo)`);

const range = analyzeRange(samples);
if (!range) {
  console.error('✗ analyzeRange retornou null');
  process.exit(1);
}
console.log(`✓ Range:  ${midiToNoteName(range.lowMidi)} – ${midiToNoteName(range.highMidi)}  (${range.spanSemitones} semitons)`);
console.log(`  Tessitura: ${midiToNoteName(range.tessituraLowMidi)} – ${midiToNoteName(range.tessituraHighMidi)}`);
console.log(`  Mediana:   ${midiToNoteName(range.medianMidi)}`);

const timbre = analyzeTimbre(samples, range);
console.log(`✓ Timbre:`);
console.log(`    brilho:   ${(timbre.brightness * 100).toFixed(0)}%`);
console.log(`    calor:    ${(timbre.warmth * 100).toFixed(0)}%`);
console.log(`    sopro:    ${(timbre.breathiness * 100).toFixed(0)}%`);
console.log(`    expressão: ${(timbre.expressiveness * 100).toFixed(0)}%`);
console.log(`    vibrato:  ${timbre.vibratoRateHz ? timbre.vibratoRateHz.toFixed(1) + ' Hz, ' + timbre.vibratoExtentCents + ' cents' : 'não detectado'}`);
console.log(`    adjetivos: ${timbre.adjectives.join(', ')}`);

const fach = classifyFach(range);
console.log(`✓ Fach:   ${fach.primaryLabel}  (${(fach.confidence * 100).toFixed(0)}%)`);
console.log(`    "${fach.humanPhrase.replace(/\*\*/g, '')}"`);

const matches = matchSongs(
  { range, timbre, fach: fach.primary },
  10
);
console.log(`✓ Matches (${matches.length}):`);
matches.forEach((m, i) => {
  const transposeStr = m.transpose === 0 ? 'tom original' : `${m.transpose > 0 ? '+' : ''}${m.transpose} semitons`;
  console.log(
    `    ${i + 1}. ${m.song.title.padEnd(28)}  ${m.song.artist.padEnd(28)}  match ${(m.score * 100).toFixed(0)}%  ${transposeStr}`
  );
});

// === 3. Validações duras ===
const errors = [];
if (range.spanSemitones < 12) errors.push(`Range esperado ≥12 semitons, obteve ${range.spanSemitones}`);
if (range.spanSemitones > 30) errors.push(`Range esperado ≤30 semitons, obteve ${range.spanSemitones}`);
if (!['mezzo-soprano', 'soprano', 'contralto'].includes(fach.primary)) {
  errors.push(`Fach esperado mezzo/soprano/contralto, obteve "${fach.primary}"`);
}
if (matches.length < 3) errors.push(`Esperado ≥3 matches, obteve ${matches.length}`);

if (errors.length > 0) {
  console.error('\n✗ Erros encontrados:');
  errors.forEach((e) => console.error('   -', e));
  process.exit(1);
}

console.log('\n✓ Pipeline analítica funcionando ponta a ponta.');
