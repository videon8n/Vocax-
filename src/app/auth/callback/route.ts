import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Callback do magic link Supabase. Troca o code por sessão e redireciona.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/perfil';

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
