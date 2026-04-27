/**
 * Rate limit em memória (sliding window) para edge/serverless.
 *
 * Limitação: é por instância. Em produção com múltiplas instâncias,
 * substituir por Vercel KV / Upstash Ratelimit. Para o MVP basta —
 * o objetivo é frear abuso casual e bots, não DDoS distribuído.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const STORE: Map<string, Bucket> = new Map();

// limpeza preguiçosa (LRU não — só apaga em hits expirados)
function cleanup(now: number) {
  if (STORE.size < 10_000) return;
  for (const [k, v] of STORE.entries()) {
    if (v.resetAt < now) STORE.delete(k);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanup(now);
  const bucket = STORE.get(key);
  if (!bucket || bucket.resetAt < now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    STORE.set(key, fresh);
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** IP do cliente em runtime Edge — Vercel coloca em x-forwarded-for. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
