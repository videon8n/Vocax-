'use client';

import { getSupabaseBrowser } from './client';
import type { VoiceProfile } from '@/state/session-store';

const TABLE = 'voice_profiles';

export interface VoiceProfileRow {
  id: string;
  user_id: string;
  profile: VoiceProfile;
  created_at: string;
}

export async function pushProfile(profile: VoiceProfile): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseBrowser();
  if (!sb) return { ok: false, error: 'supabase_not_configured' };
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr || !user) return { ok: false, error: 'not_authenticated' };
  const { error } = await sb.from(TABLE).insert({
    user_id: user.id,
    profile,
    created_at: new Date(profile.createdAt).toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listProfiles(): Promise<VoiceProfileRow[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];
  const { data, error } = await sb
    .from(TABLE)
    .select('id, user_id, profile, created_at')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as VoiceProfileRow[];
}

export async function deleteAllForUser(): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseBrowser();
  if (!sb) return { ok: false, error: 'supabase_not_configured' };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };
  const { error: dbErr } = await sb.from(TABLE).delete().eq('user_id', user.id);
  if (dbErr) return { ok: false, error: dbErr.message };
  // Apaga conta inteira (cascade RLS)
  const { error: authErr } = await sb.auth.admin.deleteUser(user.id);
  if (authErr) {
    // se admin client não estiver disponível, ao menos faz signOut
    await sb.auth.signOut();
  }
  return { ok: true };
}

export function exportProfilesAsJson(rows: VoiceProfileRow[]): string {
  return JSON.stringify(
    rows.map((r) => ({
      analyzedAt: r.created_at,
      profile: r.profile,
    })),
    null,
    2
  );
}
