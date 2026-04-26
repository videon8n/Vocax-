'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

interface WaveVisualProps {
  /** Nível de amplitude 0..1 (RMS). */
  level: number;
  /** Confiança 0..1, controla cor. */
  confidence?: number;
  className?: string;
  /** Pulso visual quando true. */
  active?: boolean;
}

/**
 * Círculo respiratório que pulsa com a voz do usuário.
 * Inspirado nas animações do Calm/Headspace.
 */
export function WaveVisual({ level, confidence = 1, className, active = true }: WaveVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const targetRef = useRef(level);

  useEffect(() => {
    targetRef.current = level;
  }, [level]);

  useEffect(() => {
    if (!ref.current) return;
    let raf = 0;
    let current = 0;
    const tick = () => {
      current = current * 0.78 + targetRef.current * 0.22; // suavização
      const scale = 1 + Math.min(1.4, current * 14);
      const opacity = 0.55 + Math.min(0.45, current * 6);
      if (ref.current) {
        ref.current.style.setProperty('--scale', String(scale));
        ref.current.style.setProperty('--opacity', String(opacity));
      }
      raf = requestAnimationFrame(tick);
    };
    if (active) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div
        ref={ref}
        aria-hidden
        className="relative h-48 w-48 rounded-full bg-vocax-gradient blur-xl"
        style={{
          transform: 'scale(var(--scale, 1))',
          opacity: 'var(--opacity, 0.6)',
          transition: 'transform 80ms linear, opacity 200ms linear',
          filter: confidence < 0.4 ? 'saturate(0.4) hue-rotate(-30deg)' : undefined,
        }}
      />
      <div
        aria-hidden
        className={cn(
          'absolute h-32 w-32 rounded-full bg-vocax-gradient',
          active && 'animate-breath'
        )}
      />
      <div className="absolute h-20 w-20 rounded-full bg-graphite-900 ring-1 ring-white/10 backdrop-blur-md" />
    </div>
  );
}
