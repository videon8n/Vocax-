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

export async function deleteAllForUser(): Promise<{ ok: boolean; error?: string; warn?: string }> {
  // O endpoint /api/account roda no server e tem acesso ao service role
  // (quando configurado). No client, fazer admin.deleteUser falha silenciosamente.
  try {
    const res = await fetch('/api/account', { method: 'DELETE' });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      warn?: string;
    };
    if (!res.ok) return { ok: false, error: data.error ?? `http_${res.status}` };
    return { ok: true, warn: data.warn };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network_error' };
  }
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
