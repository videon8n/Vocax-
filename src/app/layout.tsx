import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://vocax.app'),
  title: {
    default: 'Vocax — Descubra a sua voz',
    template: '%s · Vocax',
  },
  description:
    'Análise vocal com IA. Em 90 segundos, descubra seu timbre, sua extensão e as músicas que caem na sua voz.',
  applicationName: 'Vocax',
  // manifest gerado automaticamente por src/app/manifest.ts (Next.js convention)
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
  },
};

export const viewport: Viewport = {
  themeColor: '#0E0E12',
  width: 'device-width',
  initialScale: 1,
  // WCAG 2.5.4: usuário pode aplicar zoom até 5x sem quebra de layout
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontDisplay.variable} ${fontSans.variable} dark`}>
      <body className="font-sans antialiased bg-mesh">
        {children}
      </body>
    </html>
  );
}
