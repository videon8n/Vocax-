import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const contentType = 'image/png';

const SIZE = { width: 1200, height: 630 };

/**
 * Imagem OG dinâmica: voice-card simplificado para Twitter/Facebook/WhatsApp.
 * Query params: ?fach=Tenor&adjectives=quente,brilhante&range=C3-G4
 *
 * Cache: 1 ano (immutable) — cada combinação tem URL única, sem invalidação.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fach = searchParams.get('fach') ?? 'A sua voz';
  const adjectives = (searchParams.get('adjectives') ?? '').split(',').filter(Boolean).slice(0, 3);
  const range = searchParams.get('range') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0E0E12',
          backgroundImage:
            'radial-gradient(at 18% 12%, rgba(245, 166, 91, 0.35), transparent 55%), radial-gradient(at 85% 85%, rgba(224, 69, 123, 0.30), transparent 55%)',
          padding: 64,
          fontFamily: 'serif',
          color: '#F5F5F7',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Topo: brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #F5A65B 0%, #E0457B 100%)',
              }}
            />
            <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>Vocax</div>
            <div style={{ marginLeft: 'auto', fontSize: 18, color: '#9A9AAA', letterSpacing: 4, textTransform: 'uppercase' }}>
              Cartão de Voz
            </div>
          </div>

          {/* Centro: orbe + fach */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 110,
                background: 'linear-gradient(135deg, #F5A65B 0%, #E0457B 100%)',
                boxShadow: '0 0 120px rgba(224, 69, 123, 0.45)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 22, color: '#9A9AAA', letterSpacing: 4, textTransform: 'uppercase' }}>
                A sua voz é
              </div>
              <div
                style={{
                  fontSize: 120,
                  marginTop: 8,
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #F5A65B 0%, #E0457B 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 700,
                }}
              >
                {fach}
              </div>
              {range && (
                <div style={{ fontSize: 28, marginTop: 18, color: '#C7C7D1', fontFamily: 'monospace' }}>
                  {range}
                </div>
              )}
            </div>
          </div>

          {/* Rodapé: adjetivos + URL */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {adjectives.map((adj) => (
                <div
                  key={adj}
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 999,
                    padding: '10px 22px',
                    fontSize: 24,
                    color: '#F5F5F7',
                  }}
                >
                  {adj}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 22, color: '#9A9AAA' }}>vocax.app</div>
          </div>
        </div>
      </div>
    ),
    { ...SIZE, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }
  );
}
