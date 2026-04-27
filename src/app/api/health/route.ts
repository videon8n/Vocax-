import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health — check leve para monitoramento externo (UptimeRobot, BetterStack).
 * Não toca em DB ou serviços — esse endpoint sobe se a função edge sobe.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'vocax',
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
