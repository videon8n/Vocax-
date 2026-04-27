import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Whitelist de rotas internas pós-auth. Bloqueia open redirect via `?next=//evil.com`.
 */
const ALLOWED_REDIRECTS = new Set([
  '/perfil',
  '/perfil/historico',
  '/resultado',
  '/onboarding',
  '/musicas',
  '/',
]);

function safeNext(raw: string | null): string {
  if (!raw) return '/perfil';
  // qualquer coisa que não comece com `/` ou que comece com `//` é externa
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/perfil';
  // só aceita rotas explicitamente listadas
  return ALLOWED_REDIRECTS.has(raw) ? raw : '/perfil';
}

/**
 * Callback do magic link Supabase. Troca o code por sessão e redireciona
 * apenas para rotas internas conhecidas.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${origin}/perfil?auth=disabled`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/perfil?auth=missing-code`);
  }

  const sb = await getSupabaseServer();
  if (!sb) {
    return NextResponse.redirect(`${origin}/perfil?auth=disabled`);
  }
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/perfil?auth=error`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
