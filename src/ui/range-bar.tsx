'use client';

import { midiToNoteName } from '@/lib/music';
import { cn } from '@/lib/cn';

interface RangeBarProps {
  lowMidi: number;
  highMidi: number;
  tessituraLowMidi: number;
  tessituraHighMidi: number;
  /** Faixa do "piano visual": default 36 (C2) a 84 (C6). */
  pianoLow?: number;
  pianoHigh?: number;
  className?: string;
}

/**
 * Barra horizontal estilo teclado de piano mostrando a extensão do usuário.
 * A área âmbar = extensão total. A área magenta = tessitura confortável.
 */
export function RangeBar({
  lowMidi,
  highMidi,
  tessituraLowMidi,
  tessituraHighMidi,
  pianoLow = 36,
  pianoHigh = 84,
  className,
}: RangeBarProps) {
  const span = pianoHigh - pianoLow;
  const pct = (m: number) => Math.max(0, Math.min(100, ((m - pianoLow) / span) * 100));
  const left = pct(lowMidi);
  const right = pct(highMidi);
  const tessLeft = pct(tessituraLowMidi);
  const tessRight = pct(tessituraHighMidi);

  // Marcas de oitava
  const octaveTicks: number[] = [];
  for (let m = Math.ceil(pianoLow / 12) * 12; m <= pianoHigh; m += 12) {
    octaveTicks.push(m);
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-12 rounded-xl bg-graphite-800/60 border border-white/[0.05] overflow-hidden">
        {/* Tickmarks de oitava */}
        {octaveTicks.map((m) => (
          <div
            key={m}
            className="absolute top-0 bottom-0 w-px bg-white/5"
            style={{ left: `${pct(m)}%` }}
          />
        ))}
        {/* Extensão total (âmbar) */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-amber/40"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        {/* Tessitura (magenta brilhante) */}
        <div
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-vocax-gradient shadow-lg shadow-magenta/30"
          style={{ left: `${tessLeft}%`, width: `${tessRight - tessLeft}%` }}
        />
        {/* Marca da nota grave */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber"
          style={{ left: `${left}%` }}
        />
        {/* Marca da nota aguda */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-magenta"
          style={{ left: `${right}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-graphite-300 font-mono">
        <span>{midiToNoteName(pianoLow)}</span>
        <span className="text-amber">
          {midiToNoteName(lowMidi)} ↔ {midiToNoteName(highMidi)}
        </span>
        <span>{midiToNoteName(pianoHigh)}</span>
      </div>
    </div>
  );
}
