import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vocax.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }> = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/onboarding', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/sobre', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacidade', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/termos', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/blog/o-que-e-fach', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog/tipos-de-voz-pt-br', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog/escolher-musica-pra-cantar', priority: 0.7, changeFrequency: 'monthly' },
  ];
  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
