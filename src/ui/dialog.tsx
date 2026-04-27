'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Marca o conteúdo como destrutivo (estilo de borda vermelha). */
  destructive?: boolean;
}

/**
 * Dialog modal acessível usando o elemento <dialog> nativo do HTML.
 *
 * Vantagens vs portal customizado:
 *  - top layer browser-managed (sempre acima do conteúdo)
 *  - focus trap automático
 *  - Escape fecha por padrão (capturamos o evento `cancel`)
 *  - inert siblings sem precisar de aria-hidden manual
 */
export function Dialog({ open, onClose, title, description, children, destructive }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      try {
        el.showModal();
      } catch {
        // showModal pode falhar se o dialog já estiver aberto — ignoramos
      }
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const onClick = (e: MouseEvent) => {
      // clique no backdrop fora do conteúdo fecha o dialog
      if (e.target === el) onClose();
    };
    el.addEventListener('cancel', onCancel);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('cancel', onCancel);
      el.removeEventListener('click', onClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={cn(
        'p-0 m-auto rounded-2xl border bg-graphite-900 text-graphite-50 shadow-2xl',
        'backdrop:bg-black/70 backdrop:backdrop-blur-sm',
        'max-w-md w-[calc(100%-2rem)]',
        destructive ? 'border-danger/40' : 'border-white/10'
      )}
    >
      <div className="p-6">
        <h2 id={titleId} className="font-display text-2xl leading-tight">
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-3 text-graphite-200 leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </dialog>
  );
}
