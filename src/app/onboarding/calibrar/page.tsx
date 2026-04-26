'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/ui/header';
import { Button } from '@/ui/button';
import { WaveVisual } from '@/ui/wave-visual';
import { usePitchStream } from '@/features/pitch/use-pitch-stream';
import { Mic, MicOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CalibrarPage() {
  const router = useRouter();
  const { status, start, stop, latest, rmsLevel, error } = usePitchStream();
  const [stage, setStage] = useState<'pre' | 'listening' | 'good' | 'too-quiet' | 'too-loud'>('pre');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status !== 'listening') return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [status]);

  // Avalia a qualidade do mic ao longo do tempo
  useEffect(() => {
    if (status !== 'listening') return;
    if (rmsLevel < 0.005) setStage('too-quiet');
    else if (rmsLevel > 0.6) setStage('too-loud');
    else setStage('good');
  }, [rmsLevel, status, tick]);

  const canProceed = stage === 'good' && status === 'listening';

  const stageMessage = useMemo(() => {
    if (status === 'idle') return 'Toque para liberar o microfone.';
    if (status === 'starting') return 'Pedindo permissão…';
    if (status === 'error') return error?.message ?? 'Algo deu errado.';
    if (stage === 'too-quiet') return 'Não estou ouvindo muito. Fale ou cante uma nota.';
    if (stage === 'too-loud') return 'Está alto demais — afaste o microfone um pouco.';
    if (stage === 'good') return 'Perfeito. Pode prosseguir quando quiser.';
    return '';
  }, [status, stage, error]);

  function handleProceed() {
    stop();
    router.push('/onboarding/exercicio');
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm uppercase tracking-[0.2em] text-amber mb-4">Passo 1 de 3</p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight tracking-tight">
          Vamos checar o seu microfone.
        </h1>
        <p className="mt-4 text-graphite-200">
          Diga "alô, alô, testando" ou cante a primeira nota que vier à cabeça.
        </p>

        <div className="mt-12 flex flex-col items-center">
          <WaveVisual
            level={rmsLevel}
            confidence={latest?.confidence ?? 0}
            active={status === 'listening'}
          />

          <div className="mt-8 min-h-[60px] text-center">
            <p
              className={`text-lg ${
                stage === 'good' && status === 'listening' ? 'text-sage' : 'text-graphite-100'
              }`}
              role="status"
              aria-live="polite"
            >
              {stageMessage}
            </p>
            {status === 'listening' && (
              <p className="mt-2 text-sm text-graphite-300">
                {latest?.hz ? `Detectado: ${latest.hz.toFixed(0)} Hz` : 'Aguardando voz…'}
              </p>
            )}
          </div>

          {status === 'idle' && (
            <Button onClick={() => start()} size="lg" className="mt-6">
              <Mic className="h-5 w-5" />
              Liberar microfone
            </Button>
          )}

          {status === 'starting' && (
            <Button disabled loading size="lg" className="mt-6">
              Conectando…
            </Button>
          )}

          {status === 'error' && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle className="h-5 w-5" />
                <span>{error?.message}</span>
              </div>
              <Button onClick={() => start()} variant="ghost">
                Tentar de novo
              </Button>
            </div>
          )}

          {status === 'listening' && (
            <div className="mt-6 flex gap-3 flex-col sm:flex-row">
              <Button
                onClick={handleProceed}
                size="lg"
                disabled={!canProceed}
                className="group"
              >
                {canProceed && <CheckCircle2 className="h-5 w-5" />}
                {canProceed ? 'Continuar' : 'Aguardando som…'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button onClick={stop} variant="ghost" size="lg">
                <MicOff className="h-5 w-5" />
                Parar
              </Button>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/onboarding" className="text-sm text-graphite-300 hover:text-graphite-100">
            ← Voltar
          </Link>
        </div>
      </main>
    </>
  );
}
