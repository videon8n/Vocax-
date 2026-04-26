'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, full, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium select-none',
          'transition-all duration-240 ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variant === 'primary' &&
            'bg-vocax-gradient text-white shadow-lg shadow-magenta/25 hover:scale-[1.02] active:scale-[0.98]',
          variant === 'ghost' &&
            'border border-white/10 bg-white/5 text-graphite-100 backdrop-blur-md hover:bg-white/10 hover:border-white/20',
          variant === 'danger' &&
            'bg-danger/90 text-white hover:bg-danger',
          size === 'md' && 'px-5 py-3 text-base min-h-[48px]',
          size === 'lg' && 'px-7 py-4 text-lg min-h-[56px]',
          full && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
