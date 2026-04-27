'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** ms antes de auto-dismiss. 0 = persistente. Default 4000. */
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, duration: 4000, ...t }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export function toast(t: Omit<Toast, 'id'>) {
  return useToastStore.getState().push(t);
}

const ICONS: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-sage/30 bg-sage/10 text-sage',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-amber/30 bg-amber/10 text-amber',
};

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = ICONS[t.tone];

  useEffect(() => {
    if (!t.duration) return;
    const id = setTimeout(() => dismiss(t.id), t.duration);
    return () => clearTimeout(id);
  }, [t.id, t.duration, dismiss]);

  return (
    // role apenas — aria-live mora no container ancestral, evitando dupla locução
    <div
      role={t.tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-graphite-900/95 backdrop-blur-md p-4 pr-3 shadow-card-lg',
        'animate-slide-up min-w-[280px] max-w-[420px]'
      )}
    >
      <span className={cn('mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', TONE_STYLES[t.tone])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-graphite-50">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-sm text-graphite-200">{t.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        aria-label="Fechar notificação"
        className="text-graphite-300 hover:text-graphite-50 transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      role="region"
      aria-label="Notificações"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-[420px]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}
