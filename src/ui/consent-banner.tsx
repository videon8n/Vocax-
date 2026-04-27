'use client';

import { useEffect, useState } from 'react';
import { Shield, X } from 'lucide-react';
import { usePreferences } from '@/state/preferences-store';

/**
 * Banner LGPD não-intrusivo, pedindo opt-in para analytics anônimo.
 * Aparece somente após hidratação se o usuário ainda não respondeu.
 * Recusar é zero atrito — apenas marca consent=false e some.
 */
export function ConsentBanner() {
  const consent = usePreferences((s) => s.analyticsConsent);
  const setConsent = usePreferences((s) => s.setAnalyticsConsent);
  const hasHydrated = usePreferences((s) => s.hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasHydrated || consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Consentimento de analytics anônimo"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-40 animate-rise-in"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="rounded-2xl border border-sage/30 bg-graphite-900/95 backdrop-blur-md p-5 shadow-card-lg">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-sage/10 text-sage">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="font-medium text-graphite-50">Posso coletar métricas anônimas?</p>
            <p className="mt-1 text-sm text-graphite-200 leading-relaxed">
              Apenas eventos agregados (passos completados, gêneros preferidos), sem cookies,
              sem fingerprint, sem identificar você. Sua voz e seu perfil <strong>nunca saem</strong> do
              seu dispositivo, com ou sem isso.
            </p>
            <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setConsent(false)}
                className="rounded-xl px-4 py-2 text-sm text-graphite-200 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                Não, obrigado
              </button>
              <button
                type="button"
                onClick={() => setConsent(true)}
                className="rounded-xl bg-vocax-gradient px-4 py-2 text-sm font-medium text-white shadow-glow-magenta hover:scale-[1.02] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                Pode coletar
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConsent(false)}
            aria-label="Recusar e fechar"
            className="text-graphite-300 hover:text-graphite-50 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
