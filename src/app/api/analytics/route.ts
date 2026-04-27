import { NextResponse, type NextRequest } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

interface AnalyticsPayload {
  event: string;
  props: Record<string, string | number | boolean | null | undefined>;
  sessionId: string;
  path: string;
  timestamp: number;
}

const POSTHOG_HOST = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com';
const POSTHOG_KEY = process.env.POSTHOG_API_KEY;

// Whitelist de eventos esperados — qualquer outro é silenciosamente descartado
const ALLOWED_EVENTS = new Set([
  'landing_viewed',
  'onboarding_started',
  'mic_granted',
  'mic_denied',
  'calibration_done',
  'exercise_started',
  'exercise_paused',
  'exercise_resumed',
  'exercise_completed',
  'result_revealed',
  'card_shared',
  'compare_link_generated',
  'compare_link_opened',
  'compare_completed_analysis',
  'song_clicked',
  'profile_cleared',
  'unsupported_browser_shown',
  'web_vital',
]);

const POSTHOG_TIMEOUT_MS = 3_000;

/**
 * Proxy reverso para PostHog. Mantém ad-blockers fora do caminho
 * (eles raramente bloqueiam endpoints de mesma origem) e impede
 * vazar a API key para o cliente.
 *
 * Sem POSTHOG_API_KEY definido, a rota apenas aceita os eventos
 * (200 OK) sem encaminhar — útil em dev.
 */
export async function POST(req: NextRequest) {
  // Rate limit: 60 req/min por IP. Bots agressivos comem 1 minuto e param.
  const ip = getClientIp(req);
  const rl = rateLimit(`analytics:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Reset': rl.resetAt.toString(),
        },
      }
    );
  }

  let payload: AnalyticsPayload;
  try {
    payload = (await req.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!payload?.event || typeof payload.event !== 'string' || !ALLOWED_EVENTS.has(payload.event)) {
    return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  }

  if (!POSTHOG_KEY) {
    return NextResponse.json({ ok: true, forwarded: false });
  }

  // Timeout via AbortController para não deixar a edge function pendurada
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POSTHOG_TIMEOUT_MS);
  try {
    const res = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: payload.event,
        distinct_id: payload.sessionId,
        properties: {
          ...payload.props,
          $current_url: payload.path,
          $lib: 'vocax-proxy',
        },
        timestamp: new Date(payload.timestamp).toISOString(),
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status }, { status: 200 });
    }
  } catch {
    // timeout / erro de rede com PostHog não deve quebrar UX
  } finally {
    clearTimeout(timeout);
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
