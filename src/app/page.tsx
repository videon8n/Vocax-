'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/ui/header';
import { ArrowRight, Mic, Sparkles, Music, Shield, Instagram, Youtube } from 'lucide-react';
import { track } from '@/lib/analytics';

export default function LandingPage() {
  useEffect(() => {
    track('landing_viewed');
  }, []);
  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-vocax-radial" aria-hidden />
          <div className="mx-auto max-w-6xl px-6 pt-20 pb-28 md:pt-28 md:pb-36 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-graphite-100 backdrop-blur-md mb-8">
                <Sparkles className="h-3.5 w-3.5 text-amber" />
                Análise vocal com IA · feita no Brasil
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
                Descubra a sua voz.
                <br />
                <span className="text-gradient">Cante o que combina com ela.</span>
              </h1>
              <p className="mt-7 text-lg md:text-xl text-graphite-200 max-w-2xl leading-relaxed">
                Em 90 segundos, o Vocax escuta o seu canto, identifica o seu timbre, mapeia a sua extensão vocal e te entrega
                <strong className="text-graphite-50"> as músicas que caem na sua voz</strong> — do sertanejo ao gospel, da bossa
                ao pop.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding" className="button-primary text-lg group">
                  Começar minha análise
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#como-funciona" className="button-ghost text-lg">
                  Como funciona
                </Link>
              </div>
              <p className="mt-6 text-sm text-graphite-300">
                Grátis · Sem cadastro · Sua voz nunca sai do seu dispositivo.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-16 max-w-3xl">
            <h2 className="font-display text-3xl md:text-5xl tracking-tight leading-tight">
              Três coisas que nenhum outro app faz juntas.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Mic className="h-6 w-6" />}
              kicker="Análise"
              title="Reconhece o seu timbre"
              body="Não só a nota: a textura. Quente, brilhante, soprosa, expressiva — descrita em palavras humanas."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              kicker="Mapeamento"
              title="Mede sua extensão vocal"
              body="Da nota mais grave à mais aguda confiável. Identifica seu fach (soprano, tenor, barítono…) com a referência usada por professores de canto."
            />
            <FeatureCard
              icon={<Music className="h-6 w-6" />}
              kicker="Curadoria"
              title="Sugere músicas que cabem"
              body="Catálogo curado de MPB, sertanejo, gospel, pop e mais. Cada música vem com a chave certa para a sua voz e link direto para o Spotify."
            />
          </div>
        </section>

        {/* COMO FAZ */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-[1fr_auto] gap-16 items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-graphite-300 mb-4">Como faz a análise</p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight mb-12">
                Tecnologia de fonoaudiologia clínica, embalada em 4 passos simples.
              </h2>
              <ol className="space-y-8">
                <Step n={1} title="Calibração do microfone" body="Em 10 segundos, o Vocax checa o ambiente e o ganho do seu microfone." />
                <Step n={2} title="Exercício vocal de 90 segundos" body="Você acompanha sirenes ascendentes e arpejos. Sem julgamento — não importa se afina perfeitamente." />
                <Step n={3} title="Análise no seu navegador" body="O algoritmo YIN extrai a nota fundamental a cada 23 milissegundos. Sem servidor, sem áudio enviado." />
                <Step n={4} title="Seu Cartão de Voz" body="Em segundos, você recebe seu fach, sua extensão, seu timbre em adjetivos e suas 10 músicas." />
              </ol>
            </div>
            <div className="hidden lg:block w-[280px] aspect-[3/5] rounded-3xl bg-vocax-gradient p-1 shadow-2xl shadow-magenta/30">
              <div className="h-full w-full rounded-[22px] bg-graphite-900 flex flex-col items-center justify-center p-8 text-center">
                <div className="font-display text-2xl text-gradient">Seu Cartão de Voz</div>
                <div className="mt-6 h-24 w-24 rounded-full bg-vocax-gradient animate-breath" />
                <div className="mt-6 font-display text-3xl">Mezzo-soprano</div>
                <div className="mt-2 text-graphite-200 text-sm">G3 — D5 · 18 semitons</div>
                <div className="mt-6 flex gap-2 flex-wrap justify-center">
                  <Tag>quente</Tag>
                  <Tag>aveludada</Tag>
                  <Tag>expressiva</Tag>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRIVACIDADE */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="card flex flex-col md:flex-row gap-6 items-start">
            <div className="rounded-xl bg-sage/10 p-3 text-sage">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-2xl mb-3">Sua voz nunca sai do seu dispositivo.</h3>
              <p className="text-graphite-200 leading-relaxed">
                Voz é um dado biométrico — protegido pela LGPD. Por padrão, todo o processamento acontece no seu próprio
                navegador. Nada é gravado, nada é enviado. Você pode deletar o seu perfil a qualquer momento.
              </p>
            </div>
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-6 py-16 border-t border-white/[0.04] mt-20">
          <div className="flex flex-col md:flex-row justify-between gap-6 text-sm text-graphite-300">
            <div className="flex items-center gap-2">
              <span className="inline-block h-5 w-5 rounded bg-vocax-gradient" />
              <span className="font-display text-lg text-graphite-100">Vocax</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/blog" className="hover:text-graphite-100 transition-colors">Blog</Link>
              <Link href="/sobre" className="hover:text-graphite-100 transition-colors">Sobre</Link>
              <Link href="/privacidade" className="hover:text-graphite-100 transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-graphite-100 transition-colors">Termos</Link>
              <span className="hidden sm:inline text-graphite-500">·</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/vocax.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram do Vocax"
                  className="hover:text-graphite-100 transition-colors"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="https://youtube.com/@vocaxapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube do Vocax"
                  className="hover:text-graphite-100 transition-colors"
                >
                  <Youtube className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function FeatureCard({ icon, kicker, title, body }: { icon: React.ReactNode; kicker: string; title: string; body: string }) {
  return (
    <div className="card flex flex-col gap-4 transition-all duration-360 ease-smooth hover:bg-graphite-700/40 hover:scale-[1.01]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-vocax-gradient text-white">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-graphite-300">{kicker}</p>
      <h3 className="font-display text-2xl leading-tight">{title}</h3>
      <p className="text-graphite-200 leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-vocax-gradient/15 text-amber font-display text-2xl border border-amber/20">
        {n}
      </div>
      <div>
        <h4 className="font-display text-xl mb-1">{title}</h4>
        <p className="text-graphite-200">{body}</p>
      </div>
    </li>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-graphite-100">
      {children}
    </span>
  );
}
