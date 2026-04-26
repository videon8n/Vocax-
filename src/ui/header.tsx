import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-graphite-900/60 border-b border-white/[0.04]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-block h-7 w-7 rounded-lg bg-vocax-gradient transition-transform group-hover:scale-110" />
          <span className="font-display text-2xl tracking-tight">Vocax</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/onboarding"
            className="rounded-xl px-4 py-2 text-graphite-100 hover:bg-white/5 transition-colors"
          >
            Análise
          </Link>
          <Link
            href="/perfil"
            className="rounded-xl px-4 py-2 text-graphite-100 hover:bg-white/5 transition-colors"
          >
            Meu perfil
          </Link>
        </nav>
      </div>
    </header>
  );
}
