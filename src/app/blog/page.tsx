import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/ui/header';
import { POSTS } from '@/data/blog/posts';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Fundamentos de voz, prática vocal e curadoria musical. Artigos curtos para entender melhor a sua voz.',
  alternates: { canonical: '/blog' },
};

const CATEGORY_LABEL: Record<string, string> = {
  fundamentos: 'Fundamentos',
  pratica: 'Prática',
  curadoria: 'Curadoria',
};

export default function BlogIndexPage() {
  const sorted = [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-amber mb-4">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Blog
        </div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
          Sobre a sua voz, em palavras simples.
        </h1>
        <p className="mt-4 text-lg text-graphite-200 max-w-2xl">
          Artigos curtos para entender o que aparece no seu Cartão de Voz — e o que fazer
          com isso.
        </p>

        <ul className="mt-12 space-y-4">
          {sorted.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6 hover:bg-graphite-700/40 hover:border-white/10 transition-all duration-base ease-smooth"
              >
                <div className="flex items-baseline gap-3 mb-1.5 text-xs">
                  <span className="text-amber uppercase tracking-wider">
                    {CATEGORY_LABEL[p.category] ?? p.category}
                  </span>
                  <span className="text-graphite-300">·</span>
                  <span className="text-graphite-300">{p.readingMin} min de leitura</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl leading-tight tracking-tight">
                  {p.title}
                </h2>
                <p className="mt-2 text-graphite-200 leading-relaxed">{p.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-sm text-amber group-hover:gap-2 transition-all">
                  Ler artigo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
