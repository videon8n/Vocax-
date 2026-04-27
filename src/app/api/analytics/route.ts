import { NextResponse, type NextRequest } from 'next/server';

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

/**
 * Proxy reverso para PostHog. Mantém ad-blockers fora do caminho
 * (eles raramente bloqueiam endpoints de mesma origem) e impede
 * vazar a API key para o cliente.
 *
 * Sem POSTHOG_API_KEY definido, a rota apenas aceita os eventos
 * (200 OK) sem encaminhar — útil em dev.
 */
export async function POST(req: NextRequest) {
  let payload: AnalyticsPayload;
  try {
    payload = (await req.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!payload?.event || typeof payload.event !== 'string') {
    return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  }

  if (!POSTHOG_KEY) {
    // dev mode / sem chave configurada: aceita silenciosamente
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: 'POST',
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
    // erro de rede com PostHog não deve quebrar UX
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
