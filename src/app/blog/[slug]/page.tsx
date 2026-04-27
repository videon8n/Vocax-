import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/ui/header';
import { POSTS, getPost } from '@/data/blog/posts';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: 'Vocax' },
    publisher: {
      '@type': 'Organization',
      name: 'Vocax',
      logo: { '@type': 'ImageObject', url: '/icon0' },
    },
  };

  const Body = post.body;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-10 md:py-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-graphite-300 hover:text-graphite-100 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao blog
        </Link>

        <article>
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-amber mb-3">
              {post.readingMin} min de leitura · {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-graphite-200 leading-relaxed">
              {post.description}
            </p>
          </header>

          <div className="prose prose-invert mt-12 prose-headings:font-display prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-3 prose-p:text-graphite-100 prose-p:leading-relaxed prose-a:text-amber prose-a:no-underline hover:prose-a:underline prose-strong:text-graphite-50 prose-li:text-graphite-100 max-w-none">
            <Body />
          </div>
        </article>

        <div className="mt-16 rounded-2xl border border-amber/20 bg-amber/5 p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1">
            <h3 className="font-display text-2xl">Faça sua análise.</h3>
            <p className="mt-2 text-graphite-200">
              90 segundos. 100% no seu navegador. Sem cadastro.
            </p>
          </div>
          <Link href="/onboarding" className="button-primary group">
            Começar
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </main>
    </>
  );
}
