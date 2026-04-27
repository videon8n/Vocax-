import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0E0E12',
          borderRadius: 112,
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 160,
            background: 'linear-gradient(135deg, #F5A65B 0%, #E0457B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 200px rgba(224, 69, 123, 0.5)',
          }}
        >
          <div style={{ width: 128, height: 128, borderRadius: 64, background: '#0E0E12' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
