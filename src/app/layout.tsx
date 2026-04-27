import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Script from 'next/script';
import { ToastViewport } from '@/ui/toast';
import { ConsentBanner } from '@/ui/consent-banner';
import { WebVitalsReporter } from '@/ui/web-vitals-reporter';
import './globals.css';

const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
});

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vocax.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vocax — Descubra a sua voz',
    template: '%s · Vocax',
  },
  description:
    'Análise vocal com IA. Em 90 segundos, descubra seu timbre, sua extensão e as músicas que caem na sua voz.',
  applicationName: 'Vocax',
  alternates: {
    canonical: '/',
  },
  // manifest gerado automaticamente por src/app/manifest.ts
  appleWebApp: {
    capable: true,
    title: 'Vocax',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Vocax — Descubra a sua voz',
    description:
      'Análise vocal com IA. Descubra seu timbre, sua extensão e as músicas que caem na sua voz.',
    locale: 'pt_BR',
    type: 'website',
    siteName: 'Vocax',
    images: [
      {
        url: '/api/og?fach=A%20sua%20voz&adjectives=quente,brilhante,expressiva&range=C3%E2%80%94G5',
        width: 1200,
        height: 630,
        alt: 'Vocax — Cartão de Voz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vocax — Descubra a sua voz',
    description:
      'Análise vocal com IA em 90 segundos. Descubra seu timbre, sua extensão e as músicas que caem na sua voz.',
    images: ['/api/og?fach=A%20sua%20voz&adjectives=quente,brilhante,expressiva&range=C3%E2%80%94G5'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#0E0E12',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Vocax',
      operatingSystem: 'Web',
      applicationCategory: 'MusicApplication',
      url: SITE_URL,
      description:
        'Análise vocal com IA. Identifica timbre, extensão vocal, fach e recomenda músicas que cabem na sua voz.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'Organization',
      name: 'Vocax',
      url: SITE_URL,
      logo: `${SITE_URL}/icon0`,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontDisplay.variable} ${fontSans.variable} dark`}>
      <head>
        {/* Preload do AudioWorklet — economiza ~200ms até first-tap-mic */}
        <link
          rel="preload"
          href="/worklets/pitch-processor.js"
          as="script"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased bg-mesh">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        <div id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <ToastViewport />
        <ConsentBanner />
        <WebVitalsReporter />
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
