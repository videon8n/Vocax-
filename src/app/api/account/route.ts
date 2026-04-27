import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * DELETE /api/account
 *
 * Apaga conta e dados do usuário autenticado.
 *
 * Requer SUPABASE_SERVICE_ROLE_KEY no ambiente. Sem service role,
 * apenas faz signOut e apaga voice_profiles do próprio user (RLS),
 * mas não apaga o registro em auth.users (precisa admin client).
 */
export async function DELETE(_req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'auth_not_configured' }, { status: 503 });
  }
  const cookieStore = await cookies();

  // Cliente com sessão do usuário (anon key + cookies)
  const userClient = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* read-only context */
        }
      },
    },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  // 1) apaga rows do banco — o user_client respeita RLS, suficiente
  const { error: dbErr } = await userClient.from('voice_profiles').delete().eq('user_id', user.id);
  if (dbErr) {
    return NextResponse.json({ error: 'db_delete_failed', detail: dbErr.message }, { status: 500 });
  }

  // 2) tenta apagar auth.users — só funciona com service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const { createClient } = await import('@supabase/supabase-js');
    const adminClient = createClient(SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: authErr } = await adminClient.auth.admin.deleteUser(user.id);
    if (authErr) {
      // mesmo assim signOut pra liberar a sessão local
      await userClient.auth.signOut();
      return NextResponse.json(
        { ok: true, warn: 'data_deleted_but_account_remains', detail: authErr.message },
        { status: 200 }
      );
    }
  } else {
    // sem service role: signOut só
    await userClient.auth.signOut();
    return NextResponse.json(
      { ok: true, warn: 'service_role_unavailable_account_kept' },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true });
}
