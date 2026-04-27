/** @type {import('next').NextConfig} */

// CSP balanceada para Vocax:
// - 'unsafe-inline' em script é necessário para Schema.org JSON-LD inline e
//   Next.js bootstrap (sem nonce dinâmico no MVP).
// - connect-src libera Supabase + PostHog para o /api/analytics proxy.
// - 'self' suficiente para tudo o mais (zero CDN externo de scripts).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://eu.i.posthog.com https://us.i.posthog.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // microphone explícito = self; câmera + geo desligadas
  { key: 'Permissions-Policy', value: 'microphone=(self), camera=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // Vercel cobra lint no build — confiamos no typecheck, evitamos surpresa de regra
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        // Aplica security headers a todas as rotas exceto assets estáticos
        source: '/((?!_next/static|_next/image|favicon).*)',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/worklets/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
