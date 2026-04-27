'use client';

/**
 * Analytics anônimo: eventos enviados ao backend via /api/analytics,
 * que repassa para PostHog server-side. Zero PII, zero cookies, sem fingerprinting.
 *
 * Funciona apenas se o usuário deu opt-in no banner de consent (LGPD).
 * Sem opt-in, vira no-op silencioso.
 */

import { usePreferences } from '@/state/preferences-store';

type EventName =
  | 'landing_viewed'
  | 'onboarding_started'
  | 'mic_granted'
  | 'mic_denied'
  | 'calibration_done'
  | 'exercise_started'
  | 'exercise_paused'
  | 'exercise_resumed'
  | 'exercise_completed'
  | 'result_revealed'
  | 'card_shared'
  | 'compare_link_generated'
  | 'compare_link_opened'
  | 'compare_completed_analysis'
  | 'song_clicked'
  | 'profile_cleared'
  | 'unsupported_browser_shown'
  | 'web_vital';

type EventProps = Record<string, string | number | boolean | null | undefined>;

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return 'ssr';
  // sessão = sessionStorage (some quando aba fecha) → não é tracker persistente
  const stored = window.sessionStorage.getItem('vocax_session_id');
  if (stored) {
    sessionId = stored;
    return stored;
  }
  const generated = Math.random().toString(36).slice(2) + Date.now().toString(36);
  window.sessionStorage.setItem('vocax_session_id', generated);
  sessionId = generated;
  return generated;
}

export function track(event: EventName, props?: EventProps): void {
  if (typeof window === 'undefined') return;
  const consent = usePreferences.getState().analyticsConsent;
  if (consent !== true) return;

  // Best-effort beacon — não bloqueia UI, falha silenciosa
  try {
    const payload = JSON.stringify({
      event,
      props: props ?? {},
      sessionId: getSessionId(),
      path: window.location.pathname,
      timestamp: Date.now(),
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }));
    } else {
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // ignore
  }
}
