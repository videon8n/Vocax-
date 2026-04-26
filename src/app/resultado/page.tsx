'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/ui/header';
import { Button } from '@/ui/button';
import { VoiceCard } from '@/ui/voice-card';
import { RangeBar } from '@/ui/range-bar';
import { ShareActions } from '@/ui/share-actions';
import { useSession } from '@/state/session-store';
import { midiToNoteName } from '@/lib/music';
import { Music, RotateCcw, ArrowRight } from 'lucide-react';

export default function ResultadoPage() {
  const profile = useSession((s) => s.profile);
  const clear = useSession((s) => s.clear);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) router.replace('/onboarding');
  }, [profile, router]);

  const shareText = useMemo(() => {
    if (!profile) return '';
    const adj = profile.timbre.adjectives.slice(0, 2).join(' e ');
    return `Acabei de descobrir no Vocax: minha voz é ${profile.fach.primaryLabel}, ${adj}, com extensão de ${midiToNoteName(profile.range.lowMidi)} a ${midiToNoteName(profile.range.highMidi)}.`;
  }, [profile]);

  if (!profile) return null;

  const { range, timbre, fach, stats } = profile;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <p className="text-sm uppercase tracking-[0.2em] text-amber mb-4">Passo 3 de 3 · Resultado</p>
        <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
          {fach.primaryLabel}.<br />
          <span className="text-graphite-200">Esse é o tom da sua voz.</span>
        </h1>

        <div className="mt-12 grid lg:grid-cols-[360px_1fr] gap-10 items-start">
          {/* Cartão de voz */}
          <div>
            <VoiceCard ref={cardRef} profile={profile} />
            <div className="mt-4 flex justify-center gap-3">
              <ShareActions shareText={shareText} />
            </div>
          </div>

          {/* Análise detalhada */}
          <div className="space-y-8">
            <Section title="Sua extensão vocal" subtitle="Da nota mais grave à mais aguda confiável.">
              <RangeBar
                lowMidi={range.lowMidi}
                highMidi={range.highMidi}
                tessituraLowMidi={range.tessituraLowMidi}
                tessituraHighMidi={range.tessituraHighMidi}
                className="mt-4"
              />
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric label="Mais grave" value={midiToNoteName(range.lowMidi)} />
                <Metric label="Mais aguda" value={midiToNoteName(range.highMidi)} />
                <Metric label="Total" value={`${range.spanSemitones} semitons`} />
              </div>
              <p className="mt-4 text-sm text-graphite-200">
                Sua zona confortável (tessitura) está entre{' '}
                <strong className="text-graphite-50">
                  {midiToNoteName(range.tessituraLowMidi)} e {midiToNoteName(range.tessituraHighMidi)}
                </strong>
                . É aqui que sua voz soa mais natural.
              </p>
            </Section>

            <Section title="Seu timbre" subtitle="Como sua voz é descrita por quem te escuta.">
              <div className="flex flex-wrap gap-2 mt-3">
                {timbre.adjectives.map((adj) => (
                  <span
                    key={adj}
                    className="rounded-full bg-vocax-gradient px-4 py-1.5 text-sm font-medium text-white"
                  >
                    {adj}
                  </span>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Bar label="Brilho" value={timbre.brightness} />
                <Bar label="Calor" value={timbre.warmth} />
                <Bar label="Sopro" value={timbre.breathiness} />
                <Bar label="Expressão" value={timbre.expressiveness} />
              </div>
              {timbre.vibratoRateHz && (
                <p className="mt-5 text-sm text-graphite-200">
                  Detectamos <strong className="text-graphite-50">vibrato natural</strong> de{' '}
                  {timbre.vibratoRateHz.toFixed(1)} Hz com{' '}
                  {timbre.vibratoExtentCents} cents de extensão. Sinal de domínio respiratório.
                </p>
              )}
            </Section>

            <Section title="Seu fach" subtitle="A classificação que professores de canto usam.">
              <div className="mt-3 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-5">
                <p
                  className="text-base text-graphite-100 leading-relaxed"
                  // dangerouslySetInnerHTML porque a frase contém **bold** simples
                  dangerouslySetInnerHTML={{ __html: fach.humanPhrase.replace(/\*\*(.+?)\*\*/g, '<strong class="text-graphite-50">$1</strong>') }}
                />
                <div className="mt-4 flex items-center gap-3 text-sm text-graphite-300">
                  <span>Confiança</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-vocax-gradient"
                      style={{ width: `${Math.round(fach.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono">{Math.round(fach.confidence * 100)}%</span>
                </div>
              </div>
            </Section>

            <div className="rounded-2xl border border-amber/20 bg-amber/5 p-6 flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-1">
                <h3 className="font-display text-2xl">Qual música cantar?</h3>
                <p className="mt-2 text-graphite-200">
                  Escolhemos {10} faixas que cabem perfeitamente na sua voz.
                </p>
              </div>
              <Link href="/musicas" className="button-primary group">
                Ver minhas músicas
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="text-sm text-graphite-300 flex items-center gap-4 pt-4">
              <span>
                Análise gerada em{' '}
                {new Date(profile.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span>·</span>
              <span>{stats.sampleCount} amostras · {stats.durationSec.toFixed(0)}s</span>
              <span>·</span>
              <button
                onClick={() => {
                  clear();
                  router.push('/onboarding');
                }}
                className="inline-flex items-center gap-1 text-graphite-200 hover:text-graphite-50 underline-offset-4 hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Refazer análise
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="text-sm text-graphite-300">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-graphite-800/40 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-graphite-300">{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-graphite-200">{label}</span>
        <span className="font-mono text-graphite-300">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-vocax-gradient" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
