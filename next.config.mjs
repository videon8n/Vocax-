/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Vercel cobra lint no build — confiamos no typecheck, evitamos surpresa de regra
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
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
