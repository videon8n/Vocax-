import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  /** Forma circular para avatars/orbes. */
  circle?: boolean;
}

/**
 * Skeleton loader animado (shimmer). Respeita prefers-reduced-motion
 * via media query no globals.css.
 */
export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cn(
        'wave-bg overflow-hidden',
        circle ? 'rounded-full' : 'rounded-xl',
        'opacity-50',
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
