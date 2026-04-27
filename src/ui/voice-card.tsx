'use client';

import { forwardRef, useEffect, useState } from 'react';
import { midiToNoteName } from '@/lib/music';
import type { VoiceProfile } from '@/state/session-store';

interface VoiceCardProps {
  profile: VoiceProfile;
  /** Versão para captura (sem animações). Útil para download de PNG. */
  staticForCapture?: boolean;
}

/**
 * Cartão de Voz — momento "uau", otimizado para compartilhar.
 * Versão animada por padrão; passe `staticForCapture` para snapshot.
 */
export const VoiceCard = forwardRef<HTMLDivElement, VoiceCardProps>(
  ({ profile, staticForCapture = false }, ref) => {
    const { range, timbre, fach } = profile;
    const lowName = midiToNoteName(range.lowMidi);
    const highName = midiToNoteName(range.highMidi);
    const adjectives = timbre.adjectives.slice(0, 3);

    const [reduceMotion, setReduceMotion] = useState(false);
    useEffect(() => {
      if (typeof window === 'undefined') return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReduceMotion(mq.matches);
      update();
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }, []);

    const animate = !staticForCapture && !reduceMotion;

    return (
      <div
        ref={ref}
        className="relative aspect-[9/16] w-full max-w-[360px] mx-auto rounded-3xl overflow-hidden bg-graphite-950 shadow-card-lg"
        style={{
          backgroundImage:
            'radial-gradient(at 20% 10%, rgba(245, 166, 91, 0.35), transparent 55%), radial-gradient(at 85% 90%, rgba(224, 69, 123, 0.30), transparent 55%)',
        }}
        role="img"
        aria-label={`Cartão de voz: ${fach.primaryLabel}, extensão de ${lowName} a ${highName}, timbre ${adjectives.join(', ')}.`}
      >
        <div className="absolute inset-0 p-7 flex flex-col">
          {/* Topo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block h-5 w-5 rounded bg-vocax-gradient" />
              <span className="font-display text-lg">Vocax</span>
            </div>
            <span className="text-xs text-graphite-300 uppercase tracking-wider">Cartão de Voz</span>
          </div>

          {/* Onda animada — orbes concêntricos */}
          <div className="flex-1 flex items-center justify-center my-4" aria-hidden="true">
            <div className="relative h-40 w-40">
              {/* Orbe externo respira lento */}
              <div
                className="absolute inset-0 rounded-full bg-vocax-gradient blur-3xl"
                style={{
                  opacity: 0.45,
                  animation: animate ? 'breath 4.2s ease-in-out infinite' : undefined,
                }}
              />
              {/* Orbe médio em outro tempo */}
              <div
                className="absolute inset-2 rounded-full bg-vocax-gradient blur-2xl"
                style={{
                  opacity: 0.6,
                  animation: animate ? 'pulseSoft 2.8s ease-in-out infinite' : undefined,
                }}
              />
              {/* Orbe central nítido */}
              <div
                className="absolute inset-6 rounded-full bg-vocax-gradient"
                style={{ animation: animate ? 'breath 3.4s ease-in-out infinite' : undefined }}
              />
              {/* Aro fino para textura */}
              <div className="absolute inset-1 rounded-full border border-white/15" />
            </div>
          </div>

          {/* Fach + extensão */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-graphite-300">A sua voz é</p>
            <h2 className="font-display text-4xl mt-1.5 leading-none text-gradient">
              {fach.primaryLabel}
            </h2>
            <p className="mt-3 font-mono text-sm text-graphite-200">
              {lowName} — {highName} · {range.spanSemitones} semitons
            </p>
          </div>

          {/* Adjetivos */}
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {adjectives.map((adj) => (
              <span
                key={adj}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-graphite-50 backdrop-blur-md"
              >
                {adj}
              </span>
            ))}
          </div>

          {/* Rodapé */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-graphite-300">
              Análise feita em vocax.app · {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    );
  }
);
VoiceCard.displayName = 'VoiceCard';
