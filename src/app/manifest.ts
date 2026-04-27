import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vocax — Descubra a sua voz',
    short_name: 'Vocax',
    description:
      'Análise vocal com IA. Descubra seu timbre, sua extensão e as músicas que caem na sua voz.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0E0E12',
    theme_color: '#0E0E12',
    orientation: 'portrait-primary',
    lang: 'pt-BR',
    categories: ['music', 'education', 'lifestyle'],
    icons: [
      // SVG: browsers modernos preferem (vetorial)
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      // Conventions Next.js — geram via ImageResponse
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/icon0', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon1', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}
