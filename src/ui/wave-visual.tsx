'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    targetRef.current = level;
  }, [level]);

  // prefers-reduced-motion: WCAG 2.3.3 — desliga animação respiratória
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (reduceMotion) {
      // estado estático: escala fixa proporcional ao nível atual, sem RAF
      const scale = 1 + Math.min(0.3, targetRef.current * 4);
      const opacity = 0.6 + Math.min(0.3, targetRef.current * 4);
      ref.current.style.setProperty('--scale', String(scale));
      ref.current.style.setProperty('--opacity', String(opacity));
      return;
    }
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
  }, [active, reduceMotion]);

  return (
    <div className={cn('relative flex items-center justify-center', className)} aria-hidden="true">
      <div
        ref={ref}
        className="relative h-48 w-48 rounded-full bg-vocax-gradient blur-xl"
        style={{
          transform: 'scale(var(--scale, 1))',
          opacity: 'var(--opacity, 0.6)',
          transition: 'transform 80ms linear, opacity 200ms linear',
          filter: confidence < 0.4 ? 'saturate(0.4) hue-rotate(-30deg)' : undefined,
        }}
      />
      <div
        className={cn(
          'absolute h-32 w-32 rounded-full bg-vocax-gradient',
          active && !reduceMotion && 'animate-breath'
        )}
      />
      <div className="absolute h-20 w-20 rounded-full bg-graphite-900 ring-1 ring-white/10 backdrop-blur-md" />
    </div>
  );
}
