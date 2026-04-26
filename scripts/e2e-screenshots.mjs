/**
 * Visita cada rota com Chromium real (Playwright), valida renderização
 * e tira screenshots para o diretório screenshots/.
 *
 * Uso: pnpm start &  &&  node scripts/e2e-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:3000';
const OUT = 'screenshots';
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { name: '01-landing',           path: '/' },
  { name: '02-onboarding-intro',  path: '/onboarding' },
  { name: '03-calibrar',          path: '/onboarding/calibrar' },
  { name: '04-exercicio',         path: '/onboarding/exercicio' },
  { name: '05-perfil-vazio',      path: '/perfil' },
  { name: '06-privacidade',       path: '/privacidade' },
  { name: '07-sobre',             path: '/sobre' },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

// === 1. Visita normal de cada rota ===
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`PAGE ERROR: ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`CONSOLE ERROR: ${msg.text()}`);
});
page.on('response', (resp) => {
  if (resp.status() >= 400) errors.push(`HTTP ${resp.status()} ${resp.url()}`);
});

for (const r of ROUTES) {
  await page.goto(BASE + r.path, { waitUntil: 'networkidle', timeout: 15000 });
  // dá tempo do gradient/CSS carregar
  await page.waitForTimeout(450);
  const title = await page.title();
  await page.screenshot({ path: path.join(OUT, `${r.name}.png`), fullPage: true });
  console.log(`✓ ${r.path.padEnd(30)} title="${title}"`);
}

// === 2. Sessão simulada: injeta um perfil para ver Resultado + Músicas ===
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  const profile = {
    state: {
      profile: {
        createdAt: Date.now(),
        range: {
          lowMidi: 57, highMidi: 79,
          tessituraLowMidi: 64, tessituraHighMidi: 72,
          medianMidi: 67, sampleCount: 2700, spanSemitones: 22,
        },
        timbre: {
          brightness: 0.43, warmth: 0.62, breathiness: 0.18,
          roughness: 0.2, vibratoRateHz: 5.5, vibratoExtentCents: 32,
          expressiveness: 0.55,
          adjectives: ['quente', 'aveludada', 'expressiva'],
        },
        fach: {
          primary: 'mezzo-soprano',
          primaryLabel: 'Mezzo-soprano',
          secondary: 'soprano',
          confidence: 0.42,
          humanPhrase: 'Sua voz se aproxima de **Mezzo-soprano**, com algumas notas de Soprano.',
        },
        stats: { durationSec: 90, sampleCount: 2700, pitchAccuracyHint: 0.86 },
      },
    },
    version: 0,
  };
  localStorage.setItem('vocax-session-v1', JSON.stringify(profile));
});

const SESSIONED = [
  { name: '08-resultado',   path: '/resultado' },
  { name: '09-musicas',     path: '/musicas' },
  { name: '10-perfil-cheio', path: '/perfil' },
];
for (const r of SESSIONED) {
  await page.goto(BASE + r.path, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(700);
  const title = await page.title();
  await page.screenshot({ path: path.join(OUT, `${r.name}.png`), fullPage: true });
  console.log(`✓ ${r.path.padEnd(30)} title="${title}"`);
}

// Pagina mobile do Voice Card (compartilhamento)
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone 14
  deviceScaleFactor: 2,
});
const mpage = await mobile.newPage();
await mpage.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await mpage.evaluate(() => {
  const profile = JSON.parse(localStorage.getItem('vocax-session-v1') ?? 'null');
  // segura — não foi setado neste novo context
  return profile;
});
await mpage.evaluate(() => {
  const profile = {
    state: {
      profile: {
        createdAt: Date.now(),
        range: { lowMidi: 57, highMidi: 79, tessituraLowMidi: 64, tessituraHighMidi: 72, medianMidi: 67, sampleCount: 2700, spanSemitones: 22 },
        timbre: { brightness: 0.43, warmth: 0.62, breathiness: 0.18, roughness: 0.2, vibratoRateHz: 5.5, vibratoExtentCents: 32, expressiveness: 0.55, adjectives: ['quente', 'aveludada', 'expressiva'] },
        fach: { primary: 'mezzo-soprano', primaryLabel: 'Mezzo-soprano', secondary: 'soprano', confidence: 0.42, humanPhrase: 'Sua voz se aproxima de **Mezzo-soprano**, com algumas notas de Soprano.' },
        stats: { durationSec: 90, sampleCount: 2700, pitchAccuracyHint: 0.86 },
      },
    },
    version: 0,
  };
  localStorage.setItem('vocax-session-v1', JSON.stringify(profile));
});
await mpage.goto(BASE + '/resultado', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(700);
await mpage.screenshot({ path: path.join(OUT, '11-mobile-resultado.png'), fullPage: true });
console.log(`✓ mobile /resultado (390×844)`);

await mpage.goto(BASE + '/', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(500);
await mpage.screenshot({ path: path.join(OUT, '12-mobile-landing.png'), fullPage: true });
console.log(`✓ mobile / (390×844)`);

await mpage.goto(BASE + '/musicas', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(700);
await mpage.screenshot({ path: path.join(OUT, '13-mobile-musicas.png'), fullPage: true });
console.log(`✓ mobile /musicas (390×844)`);

await browser.close();

console.log('\n--- Console/page errors ---');
if (errors.length === 0) console.log('Nenhum erro JS no navegador.');
else errors.forEach((e) => console.log(' -', e));

console.log(`\nScreenshots salvos em ${OUT}/`);
console.log(fs.readdirSync(OUT).sort().map((f) => '  ' + f).join('\n'));
