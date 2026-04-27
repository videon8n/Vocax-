'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/ui/header';
import { Button } from '@/ui/button';
import { Dialog } from '@/ui/dialog';
import { useSession } from '@/state/session-store';
import { midiToNoteName } from '@/lib/music';
import { Music, RotateCcw, ArrowRight, Trash2 } from 'lucide-react';

export default function PerfilPage() {
  const profile = useSession((s) => s.profile);
  const clear = useSession((s) => s.clear);
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!profile) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl">Você ainda não tem um perfil vocal.</h1>
          <p className="mt-3 text-graphite-200">
            Faça sua primeira análise — leva 90 segundos e nada é enviado pela internet.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="button-primary">
              Começar agora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl tracking-tight">Meu perfil</h1>
        <p className="mt-3 text-graphite-200">
          Salvo apenas no seu navegador. Para apagar, clique em "Esquecer-me".
        </p>

        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-graphite-300">Sua voz é</p>
              <h2 className="font-display text-3xl mt-1 text-gradient">
                {profile.fach.primaryLabel}
              </h2>
            </div>
            <p className="text-sm text-graphite-300">
              Análise de{' '}
              {new Date(profile.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <Cell label="Mais grave" value={midiToNoteName(profile.range.lowMidi)} />
            <Cell label="Mais aguda" value={midiToNoteName(profile.range.highMidi)} />
            <Cell label="Extensão" value={`${profile.range.spanSemitones} semitons`} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.timbre.adjectives.map((a) => (
              <span key={a} className="rounded-full bg-vocax-gradient px-3 py-1 text-xs text-white">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <Link href="/resultado" className="button-ghost">
            Ver análise completa
          </Link>
          <Link href="/musicas" className="button-primary">
            <Music className="h-5 w-5" />
            Ver minhas músicas
          </Link>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/onboarding')}
          >
            <RotateCcw className="h-4 w-4" />
            Refazer análise
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Esquecer-me
          </Button>
        </div>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Apagar o seu perfil vocal?"
          description="Seu cartão de voz, extensão, fach e timbre serão removidos deste navegador. Não há como desfazer."
          destructive
        >
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(false);
                clear();
                router.push('/');
              }}
            >
              <Trash2 className="h-4 w-4" />
              Apagar perfil
            </Button>
          </div>
        </Dialog>
      </main>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-graphite-300">{label}</div>
      <div className="mt-1 font-display text-xl">{value}</div>
    </div>
  );
}
