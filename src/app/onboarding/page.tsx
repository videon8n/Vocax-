import Link from 'next/link';
import { Header } from '@/ui/header';
import { Mic, Headphones, MapPin, ArrowRight } from 'lucide-react';

export default function OnboardingIntroPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-amber mb-4">Análise vocal</p>
        <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
          Vamos conhecer a sua voz.
        </h1>
        <p className="mt-6 text-lg text-graphite-200 leading-relaxed">
          São apenas 90 segundos cantando. Nenhuma resposta errada. Nada é enviado pela internet.
        </p>

        <div className="mt-12 space-y-4">
          <PrepCard
            icon={<Headphones className="h-5 w-5" />}
            title="Use fones de ouvido"
            body="Evita feedback do microfone e melhora a precisão da análise."
          />
          <PrepCard
            icon={<MapPin className="h-5 w-5" />}
            title="Encontre um lugar silencioso"
            body="Quanto menos ruído ao fundo, mais fiel a leitura do seu timbre."
          />
          <PrepCard
            icon={<Mic className="h-5 w-5" />}
            title="Microfone a 20 cm da boca"
            body="Nem muito perto (estoura), nem muito longe (perde detalhe)."
          />
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link href="/onboarding/calibrar" className="button-primary text-lg group flex-1 sm:flex-initial">
            Estou pronto
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/" className="button-ghost">
            Voltar
          </Link>
        </div>
      </main>
    </>
  );
}

function PrepCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-5">
      <div className="rounded-lg bg-amber/15 p-2.5 text-amber shrink-0">{icon}</div>
      <div>
        <h3 className="font-medium text-base">{title}</h3>
        <p className="text-graphite-200 mt-1 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
