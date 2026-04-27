'use client';

import { useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/cn';

interface InfoTooltipProps {
  /** O termo a ser explicado (renderizado inline). */
  term: string;
  /** Conteúdo do tooltip. */
  children: ReactNode;
  className?: string;
}

/**
 * Tooltip click/hover para termos técnicos (fach, tessitura, vibrato, cents).
 * Acessível: revela em focus + aria-describedby.
 */
export function InfoTooltip({ term, children, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = `tooltip-${term.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        className={cn(
          'inline-flex items-baseline gap-1 underline decoration-dotted decoration-amber/60 underline-offset-4',
          'hover:decoration-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded',
          className
        )}
      >
        {term}
        <Info className="h-3 w-3 text-amber" aria-hidden="true" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-graphite-900/98 p-3 text-xs text-graphite-100 shadow-card-lg backdrop-blur-md leading-relaxed animate-fade-in"
        >
          {children}
        </span>
      )}
    </span>
  );
}
