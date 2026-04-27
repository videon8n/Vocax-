'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Retorna null se Supabase não está configurado — features de sync
 * devem se comportar como "indisponíveis" graciosamente.
 */
export function getSupabaseBrowser() {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return cached;
}
