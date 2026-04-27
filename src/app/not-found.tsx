import Link from 'next/link';
import { Header } from '@/ui/header';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10 text-amber mb-6">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Essa nota não está no nosso pentagrama.
        </h1>
        <p className="mt-4 text-graphite-200 leading-relaxed">
          A página que você procurou não existe ou foi movida.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="button-primary">
            Voltar ao início
          </Link>
          <Link href="/onboarding" className="button-ghost">
            Fazer minha análise
          </Link>
        </div>
      </main>
    </>
  );
}
