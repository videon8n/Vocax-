/**
 * Sons opcionais gerados em runtime via Web Audio API — zero asset em bundle.
 *
 * Default desligado (toggle em /perfil). Se reduced-motion estiver ativo,
 * skipamos por respeito (assumimos que prefers-reduced-motion implica
 * preferência por menos estímulo, incluindo som).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function shouldPlay(enabled: boolean): boolean {
  if (!enabled) return false;
  if (typeof window === 'undefined') return false;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return !reduce;
}

interface ChimeOptions {
  enabled: boolean;
}

/** Sinete suave, ~250ms, para transição de fase do exercício. */
export function playChime({ enabled }: ChimeOptions): void {
  if (!shouldPlay(enabled)) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const partials = [880, 1320, 1760];
  const master = c.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.18, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
  master.connect(c.destination);
  for (const f of partials) {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(master);
    o.start(now);
    o.stop(now + 0.4);
  }
}

/** Acorde feliz curto para revelar resultado. */
export function playReveal({ enabled }: ChimeOptions): void {
  if (!shouldPlay(enabled)) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, now + i * 0.05);
    g.gain.linearRampToValueAtTime(0.14, now + i * 0.05 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.6);
    o.connect(g).connect(c.destination);
    o.start(now + i * 0.05);
    o.stop(now + i * 0.05 + 0.65);
  });
}
