/** @type {import('next').NextConfig} */

// Static export para GitHub Pages quando GITHUB_PAGES=true.
// Em dev/Vercel/Node start, comportamento normal (SSR, image optimization, etc.).
const isPages = process.env.GITHUB_PAGES === 'true';
const basePath = isPages ? '/Vocax-' : '';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },

  // Static export
  output: isPages ? 'export' : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },

  // Expõe basePath ao runtime (usado pelo AudioWorklet, etc.)
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

  async headers() {
    if (isPages) return []; // headers ignorados em export estático
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
