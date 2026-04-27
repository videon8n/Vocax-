'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { freqToMidi, midiToNoteName } from '@/lib/music';
import { cn } from '@/lib/cn';

interface PitchLineProps {
  hzHistory: Array<{ hz: number | null; confidence: number }>;
  className?: string;
  /** Notas-alvo para gabarito visual (ex: arpejo). */
  targetMidi?: number[];
}

/**
 * Visualização SCROLL da linha de pitch. Cada coluna = 1 frame.
 * Mostra ~3.5 oitavas centradas na mediana recente.
 *
 * Re-renderiza em qualquer mudança de tamanho do container (resize,
 * orientação, splitscreen) via ResizeObserver.
 */
export function PitchLine({ hzHistory, className, targetMidi }: PitchLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setSizeTick] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setSizeTick((n) => n + 1));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    // Determina range visível: pitch ± 18 semitons
    const validMidi: number[] = [];
    for (const s of hzHistory) {
      if (s.hz && s.confidence > 0.4) validMidi.push(freqToMidi(s.hz));
    }
    if (validMidi.length === 0) {
      drawHelp(ctx, W, H);
      return;
    }
    validMidi.sort((a, b) => a - b);
    const center = validMidi[Math.floor(validMidi.length / 2)];
    const lo = Math.floor(center - 18);
    const hi = Math.ceil(center + 18);
    const span = hi - lo;
    const yOf = (m: number) => H - ((m - lo) / span) * H;

    // Linhas de oitava
    for (let m = Math.ceil(lo / 12) * 12; m < hi; m += 12) {
      const y = yOf(m);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillText(midiToNoteName(m), 8, y - 4);
    }

    // Notas-alvo
    if (targetMidi && targetMidi.length > 0) {
      const stepW = W / targetMidi.length;
      ctx.fillStyle = 'rgba(245, 166, 91, 0.18)';
      targetMidi.forEach((m, i) => {
        const y = yOf(m);
        ctx.fillRect(i * stepW, y - 6, stepW, 12);
      });
    }

    // Pitch line
    const stepX = W / Math.max(60, hzHistory.length);
    ctx.lineWidth = 3;
    let inLine = false;
    hzHistory.forEach((s, i) => {
      const x = i * stepX;
      if (!s.hz || s.confidence < 0.4) {
        inLine = false;
        return;
      }
      const m = freqToMidi(s.hz);
      const y = yOf(m);
      const alpha = Math.min(1, s.confidence * 1.4);
      const color = `rgba(245, 166, 91, ${alpha})`;
      if (!inLine) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        inLine = true;
      } else {
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
    });
    ctx.stroke();

    // Ponto atual brilhante
    const last = hzHistory[hzHistory.length - 1];
    if (last?.hz && last.confidence > 0.4) {
      const y = yOf(freqToMidi(last.hz));
      const x = W - 6;
      ctx.fillStyle = '#E0457B';
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#E0457B';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [hzHistory, targetMidi]);

  const ariaLabel = useMemo(() => {
    const last = hzHistory[hzHistory.length - 1];
    if (!last?.hz || last.confidence < 0.4) {
      return 'Visualização de pitch em tempo real. Aguardando voz.';
    }
    const note = midiToNoteName(freqToMidi(last.hz));
    return `Visualização de pitch em tempo real. Nota detectada: ${note}, ${last.hz.toFixed(0)} Hertz, confiança ${Math.round(last.confidence * 100)}%.`;
  }, [hzHistory]);

  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-graphite-800/40', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <canvas ref={canvasRef} className="block w-full h-full" style={{ height: '220px' }} aria-hidden="true" />
    </div>
  );
}

function drawHelp(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '14px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Cante uma nota — sua voz aparece aqui', W / 2, H / 2);
}
