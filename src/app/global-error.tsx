'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Catch-all final do Next.js — só dispara se layout.tsx falhar.
 * Como o `<html>` ainda não foi montado, precisamos repetir a estrutura.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          background: '#0E0E12',
          color: '#F5F5F7',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Algo deu muito errado.
          </h1>
          <p style={{ color: '#C7C7D1', lineHeight: 1.6 }}>
            Recarregue a página. Se o erro persistir, espere alguns minutos e tente
            novamente.
          </p>
          {error.digest && (
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9A9AAA' }}>
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #F5A65B 0%, #E0457B 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
