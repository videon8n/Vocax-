'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/onboarding', label: 'Análise' },
  { href: '/perfil', label: 'Meu perfil' },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-graphite-900/60 border-b border-white/[0.04]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Vocax — página inicial">
          <span className="inline-block h-7 w-7 rounded-lg bg-vocax-gradient transition-transform group-hover:scale-110" aria-hidden="true" />
          <span className="font-display text-2xl tracking-tight">Vocax</span>
        </Link>
        <nav aria-label="Navegação principal" className="flex items-center gap-2 text-sm">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-xl px-4 py-2 transition-colors ${
                  active
                    ? 'bg-white/10 text-graphite-50'
                    : 'text-graphite-100 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
