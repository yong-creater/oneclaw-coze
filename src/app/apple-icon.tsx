import { ImageResponse } from 'next/og';

// Image metadata
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Image generation
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
          background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
          borderRadius: '20%',
        }}
      >
        <span style={{ fontSize: 120 }}>🦞</span>
      </div>
    ),
    { ...size }
  );
}
