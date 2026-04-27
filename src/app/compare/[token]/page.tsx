'use client';

import { use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/ui/header';
import { useSession } from '@/state/session-store';
import { decodeCompareToken, compareCompat, type CompareProfile } from '@/lib/compare-token';
import { track } from '@/lib/analytics';
import { midiToNoteName } from '@/lib/music';
import { ArrowRight, Mic, AlertCircle } from 'lucide-react';

interface Props {
  params: Promise<{ token: string }>;
}

export default function ComparePairPage({ params }: Props) {
  const { token } = use(params);
  const profile = useSession((s) => s.profile);
  const decoded = useMemo(() => decodeCompareToken(token), [token]);

  useEffect(() => {
    track('compare_link_opened', { hasOwnProfile: !!profile });
    if (profile) track('compare_completed_analysis');
  }, [profile]);

  if (!decoded) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-danger mx-auto" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl">Link inválido.</h1>
          <p className="mt-3 text-graphite-200">
            O link que você abriu está corrompido ou foi modificado.
          </p>
          <div className="mt-8">
            <Link href="/" className="button-ghost">Voltar ao início</Link>
          </div>
        </main>
      </>
    );
  }

  if (decoded.expired) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-warn mx-auto" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl">Link expirado.</h1>
          <p className="mt-3 text-graphite-200">
            Esse link de comparação é válido por 7 dias e já passou da validade.
            Peça um novo para a pessoa que mandou.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/onboarding" className="button-primary">
              Fazer minha análise
            </Link>
            <Link href="/" className="button-ghost">Voltar ao início</Link>
          </div>
        </main>
      </>
    );
  }

  const friend = decoded.profile;

  // Caso A: visitante ainda não tem profile → mostrar cartão do amigo + CTA
  if (!profile) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-sm uppercase tracking-[0.2em] text-amber mb-4">Convite recebido</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
            Conheça a voz <br />
            <span className="text-gradient">{friend.fach}.</span>
          </h1>

          <FriendSummary profile={friend} />

          <div className="mt-10 rounded-2xl border border-amber/20 bg-amber/5 p-6 flex flex-col sm:flex-row items-start gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-vocax-gradient text-white shrink-0">
              <Mic className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h3 className="font-display text-2xl">Faça sua análise para comparar.</h3>
              <p className="mt-2 text-graphite-200">
                90 segundos. Quando terminar, você volta aqui automaticamente e vê os
                dois cartões lado a lado.
              </p>
            </div>
            <Link href="/onboarding" className="button-primary group">
              Começar
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Caso B: visitante tem profile → mostrar comparação lado a lado
  const me: CompareProfile = {
    fach: profile.fach.primaryLabel,
    fachKey: profile.fach.primary,
    lowMidi: profile.range.lowMidi,
    highMidi: profile.range.highMidi,
    tessLow: profile.range.tessituraLowMidi,
    tessHigh: profile.range.tessituraHighMidi,
    spanSemitones: profile.range.spanSemitones,
    adjectives: profile.timbre.adjectives,
    brightness: profile.timbre.brightness,
    warmth: profile.timbre.warmth,
    breathiness: profile.timbre.breathiness,
    expressiveness: profile.timbre.expressiveness,
    createdAt: profile.createdAt,
  };

  const compat = compareCompat(me, friend);
  const compatPct = Math.round(compat.overall * 100);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <p className="text-sm uppercase tracking-[0.2em] text-amber mb-4">Comparação</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
          Vocês combinam <span className="text-gradient">{compatPct}%.</span>
        </h1>
        <p className="mt-3 text-graphite-200">
          Score baseado em sobreposição de extensão, tessitura e similaridade de timbre.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <CompareCard label="Você" profile={me} accent="amber" />
          <CompareCard label="Amigo(a)" profile={friend} accent="magenta" />
        </div>

        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
          <h2 className="font-display text-2xl">Detalhes do match</h2>
          <div className="mt-5 grid sm:grid-cols-3 gap-4">
            <CompatBar label="Extensão" value={compat.rangeOverlap} />
            <CompatBar label="Tessitura" value={compat.tessOverlap} />
            <CompatBar label="Timbre" value={compat.timbreSim} />
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/resultado" className="text-sm text-graphite-300 hover:text-graphite-100">
            ← Voltar ao meu resultado
          </Link>
        </div>
      </main>
    </>
  );
}

function FriendSummary({ profile }: { profile: CompareProfile }) {
  return (
    <div className="mt-8 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
      <div className="grid grid-cols-3 gap-3 text-sm">
        <Cell label="Mais grave" value={midiToNoteName(profile.lowMidi)} />
        <Cell label="Mais aguda" value={midiToNoteName(profile.highMidi)} />
        <Cell label="Extensão" value={`${profile.spanSemitones} st`} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {profile.adjectives.map((a) => (
          <span key={a} className="rounded-full bg-vocax-gradient px-3 py-1 text-xs text-white">
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

function CompareCard({
  label,
  profile,
  accent,
}: {
  label: string;
  profile: CompareProfile;
  accent: 'amber' | 'magenta';
}) {
  return (
    <div
      className={`rounded-2xl border bg-graphite-800/40 p-6 ${
        accent === 'amber' ? 'border-amber/30' : 'border-magenta/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs uppercase tracking-wider ${accent === 'amber' ? 'text-amber' : 'text-magenta'}`}>
          {label}
        </span>
      </div>
      <h3 className="font-display text-3xl text-gradient">{profile.fach}</h3>
      <p className="mt-2 font-mono text-sm text-graphite-200">
        {midiToNoteName(profile.lowMidi)} — {midiToNoteName(profile.highMidi)} · {profile.spanSemitones} semitons
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {profile.adjectives.slice(0, 3).map((a) => (
          <span key={a} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-graphite-100">
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

function CompatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-graphite-200">{label}</span>
        <span className="font-mono text-graphite-300">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-vocax-gradient" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <div className="text-xs uppercase tracking-wider text-graphite-300">{label}</div>
      <div className="mt-0.5 font-display text-lg">{value}</div>
    </div>
  );
}
