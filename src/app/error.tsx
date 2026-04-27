'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary de rota. Captura erros não-tratados em qualquer página
 * e oferece recuperação. Loga via console.error (Sentry hook fica em
 * instrumentation.ts quando configurado).
 */
export default function RouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Hook para integração futura com Sentry/Datadog
    if (typeof window !== 'undefined') {
      console.error('[RouteError]', error);
    }
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger mb-6">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight">
        Algo saiu do tom.
      </h1>
      <p className="mt-4 text-graphite-200 leading-relaxed">
        Encontramos um erro inesperado. Você pode tentar de novo ou voltar para o início.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs font-mono text-graphite-400">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-vocax-gradient px-6 py-3 text-base font-medium text-white shadow-glow-magenta transition-transform duration-base ease-smooth hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber min-h-[48px]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Tentar de novo
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-base text-graphite-100 backdrop-blur-md transition-all duration-base ease-smooth hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber min-h-[48px]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
