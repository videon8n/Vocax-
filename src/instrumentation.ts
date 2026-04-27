/**
 * Hook do Next.js para inicialização server-side. Roda uma vez por instância.
 *
 * Sentry é opcional — só ativa se NEXT_PUBLIC_SENTRY_DSN estiver definido
 * E o pacote `@sentry/nextjs` estiver instalado. Sem ambos, no-op silencioso.
 *
 * Para ativar:
 *   pnpm add @sentry/nextjs
 *   set NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
 */

interface SentryModule {
  init: (opts: Record<string, unknown>) => void;
  captureRequestError: (
    err: unknown,
    request: { path: string; method: string },
    context: { routerKind: string; routePath: string }
  ) => void;
}

async function loadSentry(): Promise<SentryModule | null> {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;
  try {
    // Dynamic import com nome calculado evita erro de typecheck quando o
    // pacote não está instalado. Vite/Next só resolve em runtime.
    const moduleName = '@sentry/nextjs';
    return (await import(/* webpackIgnore: true */ moduleName)) as unknown as SentryModule;
  } catch {
    return null;
  }
}

export async function register() {
  const Sentry = await loadSentry();
  if (!Sentry) return;
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV ?? 'development',
      release: process.env.NEXT_PUBLIC_APP_VERSION,
    });
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string }
) {
  const Sentry = await loadSentry();
  if (!Sentry) return;
  Sentry.captureRequestError(err, request, context);
}
