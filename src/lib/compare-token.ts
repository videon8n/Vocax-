/**
 * Token compartilhável para "Compare with friend" — stateless, sem servidor.
 *
 * Estrutura: base64url(JSON.stringify({ p: ProfileMin, t: timestamp }))
 *  - sem PII
 *  - validade implícita: 7 dias (timestamp checado no decode)
 *  - cabe na URL (~300-400 chars típico)
 */

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface CompareProfile {
  fach: string;
  fachKey: string; // 'soprano' | 'tenor' | etc.
  lowMidi: number;
  highMidi: number;
  tessLow: number;
  tessHigh: number;
  spanSemitones: number;
  adjectives: string[];
  brightness: number;
  warmth: number;
  breathiness: number;
  expressiveness: number;
  createdAt: number;
}

interface TokenPayload {
  p: CompareProfile;
  t: number; // generated-at timestamp
}

function base64UrlEncode(s: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(s, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  if (typeof window === 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeCompareToken(profile: CompareProfile): string {
  const payload: TokenPayload = { p: profile, t: Date.now() };
  return base64UrlEncode(JSON.stringify(payload));
}

export interface DecodedToken {
  profile: CompareProfile;
  generatedAt: number;
  expired: boolean;
}

export function decodeCompareToken(token: string): DecodedToken | null {
  try {
    const json = base64UrlDecode(token);
    const payload = JSON.parse(json) as TokenPayload;
    if (!payload?.p || typeof payload.t !== 'number') return null;
    const expired = Date.now() - payload.t > TTL_MS;
    return { profile: payload.p, generatedAt: payload.t, expired };
  } catch {
    return null;
  }
}

/** Score de compatibilidade entre duas vozes (0..1). */
export function compareCompat(a: CompareProfile, b: CompareProfile): {
  rangeOverlap: number;
  tessOverlap: number;
  timbreSim: number;
  overall: number;
} {
  const rangeOverlap = jaccard(a.lowMidi, a.highMidi, b.lowMidi, b.highMidi);
  const tessOverlap = jaccard(a.tessLow, a.tessHigh, b.tessLow, b.tessHigh);
  const timbreSim = cosine(
    [a.brightness, a.warmth, a.breathiness, a.expressiveness],
    [b.brightness, b.warmth, b.breathiness, b.expressiveness]
  );
  const overall = clamp01(rangeOverlap * 0.4 + tessOverlap * 0.35 + timbreSim * 0.25);
  return { rangeOverlap, tessOverlap, timbreSim, overall };
}

function jaccard(a1: number, a2: number, b1: number, b2: number): number {
  const inter = Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
  const union = Math.max(a2, b2) - Math.min(a1, b1);
  if (union <= 0) return 0;
  return inter / union;
}

function cosine(a: number[], b: number[]): number {
  const dot = a.reduce((acc, v, i) => acc + v * b[i], 0);
  const ma = Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));
  const mb = Math.sqrt(b.reduce((acc, v) => acc + v * v, 0));
  if (ma === 0 || mb === 0) return 0.5;
  return clamp01(dot / (ma * mb));
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
