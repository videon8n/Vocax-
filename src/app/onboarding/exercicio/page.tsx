'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/ui/header';
import { Button } from '@/ui/button';
import { WaveVisual } from '@/ui/wave-visual';
import { PitchLine } from '@/ui/pitch-line';
import { usePitchStream } from '@/features/pitch/use-pitch-stream';
import { analyzeRange } from '@/features/range/range-detector';
import { analyzeTimbre } from '@/features/timbre/timbre-analyzer';
import { classifyFach } from '@/features/fach/fach-classifier';
import { useSession } from '@/state/session-store';
import { Play, ArrowRight } from 'lucide-react';

const TOTAL_SECONDS = 90;

interface Phase {
  start: number; // seconds
  end: number;
  title: string;
  instruction: string;
  /** Sequência de notas-alvo em MIDI (ilustrativa). */
  pattern: number[];
}

const PHASES: Phase[] = [
  {
    start: 0, end: 8,
    title: 'Respire fundo.',
    instruction: 'Sente-se confortável. Expire devagar.',
    pattern: [],
  },
  {
    start: 8, end: 28,
    title: 'Sirene grave → médio.',
    instruction: 'Faça um "uuuh" deslizando do grave até o médio. Sem força.',
    pattern: [50, 53, 55, 57, 60, 62, 64],
  },
  {
    start: 28, end: 48,
    title: 'Sirene médio → agudo.',
    instruction: 'Continue o "uuuh" subindo. Pare quando começar a tensionar.',
    pattern: [60, 62, 64, 65, 67, 69, 72, 74, 76],
  },
  {
    start: 48, end: 72,
    title: 'Arpejos em "lá".',
    instruction: 'Cante "lá-lá-lá-lá-lá" subindo e descendo, como uma escala.',
    pattern: [60, 64, 67, 72, 67, 64, 60],
  },
  {
    start: 72, end: 90,
    title: 'Cante uma frase qualquer.',
    instruction: 'Solte uma frase de uma música que você ama.',
    pattern: [],
  },
];

export default function ExercicioPage() {
  const router = useRouter();
  const setProfile = useSession((s) => s.setProfile);
  const { status, start, stop, latest, rmsLevel, history, getHistory } = usePitchStream();

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Inicia automaticamente: pede mic, então começa cronômetro
  useEffect(() => {
    void start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando o stream começou a escutar, libera o exercício
  useEffect(() => {
    if (status === 'listening' && !running) {
      setRunning(true);
      startTimeRef.current = performance.now();
    }
  }, [status, running]);

  // Cronômetro
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startTimeRef.current === null) return;
      const e = (performance.now() - startTimeRef.current) / 1000;
      setElapsed(Math.min(TOTAL_SECONDS, e));
      if (e >= TOTAL_SECONDS) {
        clearInterval(id);
        finish();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function finish() {
    setRunning(false);
    const samples = getHistory();
    stop();
    processAndGo(samples);
  }

  function processAndGo(samplesArg?: ReturnType<typeof getHistory>) {
    const samples = samplesArg && samplesArg.length > 0 ? samplesArg : getHistory();
    const range = analyzeRange(samples);
    if (!range) {
      router.push('/onboarding/exercicio?retry=1');
      return;
    }
    const timbre = analyzeTimbre(samples, range);
    const fach = classifyFach(range);
    const durationSec = elapsed;
    const sampleCount = samples.length;
    const validRatio =
      samples.length > 0
        ? samples.filter((s) => s.confidence > 0.6).length / samples.length
        : 0;
    setProfile({
      createdAt: Date.now(),
      range,
      timbre,
      fach,
      stats: {
        durationSec,
        sampleCount,
        pitchAccuracyHint: validRatio,
      },
    });
    router.push('/resultado');
  }

  const currentPhase = PHASES.find((p) => elapsed >= p.start && elapsed < p.end) ?? PHASES[PHASES.length - 1];
  const progressPct = (elapsed / TOTAL_SECONDS) * 100;
  const recentHistory = history.slice(-180);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Progress + cronômetro */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-graphite-200 mb-2">
            <span className="text-amber font-medium">Passo 2 de 3 · Exercício vocal</span>
            <span className="font-mono tabular-nums">
              {Math.floor(elapsed)}s / {TOTAL_SECONDS}s
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-vocax-gradient transition-all duration-100 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Instrução grande */}
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl leading-tight tracking-tight">
            {currentPhase.title}
          </h1>
          <p className="mt-3 text-lg text-graphite-200">{currentPhase.instruction}</p>
        </div>

        {/* Visualização */}
        <div className="grid lg:grid-cols-[1fr_240px] gap-6 items-center">
          <PitchLine
            hzHistory={recentHistory.map((s) => ({ hz: s.hz, confidence: s.confidence }))}
            targetMidi={currentPhase.pattern}
          />
          <div className="flex justify-center">
            <WaveVisual level={rmsLevel} confidence={latest?.confidence ?? 0} active={running} />
          </div>
        </div>

        {/* Painel de estatística leve */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Pitch atual" value={latest?.hz ? `${latest.hz.toFixed(0)} Hz` : '—'} />
          <Stat label="Confiança" value={latest ? `${Math.round(latest.confidence * 100)}%` : '—'} />
          <Stat label="Amostras" value={`${history.length}`} />
        </div>

        {/* Controles */}
        <div className="mt-10 flex justify-center gap-3 flex-col sm:flex-row">
          {!running && elapsed === 0 && status !== 'listening' && (
            <Button size="lg" onClick={() => start()} loading={status === 'starting'}>
              <Play className="h-5 w-5" />
              Começar
            </Button>
          )}
          {running && (
            <Button size="lg" variant="ghost" onClick={finish}>
              Encerrar agora e analisar
            </Button>
          )}
          {!running && elapsed > 0 && (
            <Button size="lg" onClick={() => processAndGo()}>
              Ver meu resultado
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link href="/onboarding/calibrar" className="text-sm text-graphite-300 hover:text-graphite-100">
            ← Voltar para a calibração
          </Link>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-graphite-800/40 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-graphite-300">{label}</div>
      <div className="mt-1 font-mono tabular-nums text-base">{value}</div>
    </div>
  );
}
