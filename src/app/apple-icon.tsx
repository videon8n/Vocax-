import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            background: 'linear-gradient(135deg, #F5A65B 0%, #E0457B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 80px rgba(224, 69, 123, 0.4)',
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 22, background: '#0E0E12' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
