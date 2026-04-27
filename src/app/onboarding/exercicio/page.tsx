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
import { usePreferences } from '@/state/preferences-store';
import { playChime } from '@/lib/sound';
import { toast } from '@/ui/toast';
import { track } from '@/lib/analytics';
import { Play, Pause, ArrowRight, RotateCcw } from 'lucide-react';

const TOTAL_SECONDS = 90;

interface Phase {
  start: number;
  end: number;
  title: string;
  instruction: string;
  pattern: number[];
}

const PHASES: Phase[] = [
  { start: 0, end: 8, title: 'Respire fundo.', instruction: 'Sente-se confortável. Expire devagar.', pattern: [] },
  { start: 8, end: 28, title: 'Sirene grave → médio.', instruction: 'Faça um "uuuh" deslizando do grave até o médio. Sem força.', pattern: [50, 53, 55, 57, 60, 62, 64] },
  { start: 28, end: 48, title: 'Sirene médio → agudo.', instruction: 'Continue o "uuuh" subindo. Pare quando começar a tensionar.', pattern: [60, 62, 64, 65, 67, 69, 72, 74, 76] },
  { start: 48, end: 72, title: 'Arpejos em "lá".', instruction: 'Cante "lá-lá-lá-lá-lá" subindo e descendo, como uma escala.', pattern: [60, 64, 67, 72, 67, 64, 60] },
  { start: 72, end: 90, title: 'Cante uma frase qualquer.', instruction: 'Solte uma frase de uma música que você ama.', pattern: [] },
];

export default function ExercicioPage() {
  const router = useRouter();
  const setProfile = useSession((s) => s.setProfile);
  const soundEnabled = usePreferences((s) => s.soundEnabled);
  const { status, start, stop, latest, rmsLevel, history, getHistory } = usePitchStream();

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  // tempo "wall-clock" desde o último start/resume
  const segmentStartRef = useRef<number | null>(null);
  // soma do tempo dos segmentos anteriores quando voltou de pause
  const accumulatedRef = useRef(0);
  // fase atual para detectar mudanças e tocar chime
  const phaseIndexRef = useRef(0);

  // Inicia automaticamente: pede mic
  useEffect(() => {
    void start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando o stream começa a escutar, libera o exercício
  useEffect(() => {
    if (status === 'listening' && !running && elapsed === 0) {
      setRunning(true);
      segmentStartRef.current = performance.now();
      track('exercise_started');
    }
    if (status === 'error') track('mic_denied');
  }, [status, running, elapsed]);

  // Cronômetro com suporte a pause
  useEffect(() => {
    if (!running || paused) return;
    const id = setInterval(() => {
      if (segmentStartRef.current === null) return;
      const segment = (performance.now() - segmentStartRef.current) / 1000;
      const total = accumulatedRef.current + segment;
      const clamped = Math.min(TOTAL_SECONDS, total);
      setElapsed(clamped);

      // Detecta mudança de fase para chime
      const newPhaseIdx = PHASES.findIndex((p) => clamped >= p.start && clamped < p.end);
      if (newPhaseIdx !== -1 && newPhaseIdx !== phaseIndexRef.current) {
        phaseIndexRef.current = newPhaseIdx;
        if (newPhaseIdx > 0) playChime({ enabled: soundEnabled });
      }

      if (total >= TOTAL_SECONDS) {
        clearInterval(id);
        finish();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused, soundEnabled]);

  function handlePause() {
    if (segmentStartRef.current !== null) {
      accumulatedRef.current += (performance.now() - segmentStartRef.current) / 1000;
      segmentStartRef.current = null;
    }
    setPaused(true);
    track('exercise_paused', { elapsed: Math.round(elapsed) });
    toast({ tone: 'info', title: 'Exercício pausado', description: 'Você pode continuar quando quiser.' });
  }

  function handleResume() {
    segmentStartRef.current = performance.now();
    setPaused(false);
    track('exercise_resumed');
  }

  function handleRestart() {
    accumulatedRef.current = 0;
    segmentStartRef.current = performance.now();
    phaseIndexRef.current = 0;
    setElapsed(0);
    setPaused(false);
    setRunning(true);
  }

  function finish() {
    setRunning(false);
    setPaused(false);
    const samples = getHistory();
    stop();
    processAndGo(samples);
  }

  function processAndGo(samplesArg?: ReturnType<typeof getHistory>) {
    const samples = samplesArg && samplesArg.length > 0 ? samplesArg : getHistory();
    const range = analyzeRange(samples);
    if (!range) {
      toast({
        tone: 'error',
        title: 'Não consegui ouvir bem',
        description: 'Tente de novo num ambiente mais silencioso e cante por mais tempo.',
        duration: 6000,
      });
      router.push('/onboarding/exercicio?retry=1');
      return;
    }
    const timbre = analyzeTimbre(samples, range);
    const fach = classifyFach(range);
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
        durationSec: elapsed,
        sampleCount: samples.length,
        pitchAccuracyHint: validRatio,
      },
    });
    track('exercise_completed', {
      duration: Math.round(elapsed),
      samples: samples.length,
      fach: fach.primary,
    });
    router.push('/resultado');
  }

  // Atalho de teclado: espaço pausa/retoma
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
        e.preventDefault();
        if (running && !paused) handlePause();
        else if (running && paused) handleResume();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // handlePause/Resume são closures estáveis (criadas no componente),
    // mas seus efeitos dependem de running/paused/elapsed/soundEnabled
    // que já estão em deps via os próprios useState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused]);

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
              {paused && <span className="ml-2 text-warn">(pausado)</span>}
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do exercício"
          >
            <div
              className="h-full bg-vocax-gradient transition-all duration-100 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Instrução grande */}
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl leading-tight tracking-tight" aria-live="polite">
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
            <WaveVisual level={rmsLevel} confidence={latest?.confidence ?? 0} active={running && !paused} />
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
          {running && !paused && (
            <>
              <Button size="lg" variant="ghost" onClick={handlePause} aria-keyshortcuts="Space">
                <Pause className="h-5 w-5" />
                Pausar
              </Button>
              <Button size="lg" variant="ghost" onClick={finish}>
                Encerrar e analisar
              </Button>
            </>
          )}
          {running && paused && (
            <>
              <Button size="lg" onClick={handleResume} aria-keyshortcuts="Space">
                <Play className="h-5 w-5" />
                Continuar
              </Button>
              <Button size="lg" variant="ghost" onClick={handleRestart}>
                <RotateCcw className="h-5 w-5" />
                Recomeçar
              </Button>
              <Button size="lg" variant="ghost" onClick={finish}>
                Encerrar e analisar
              </Button>
            </>
          )}
          {!running && elapsed > 0 && (
            <Button size="lg" onClick={() => processAndGo()}>
              Ver meu resultado
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
          {!running && elapsed === 0 && status !== 'listening' && (
            <Button size="lg" onClick={() => start()} loading={status === 'starting'}>
              <Play className="h-5 w-5" />
              Começar
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
