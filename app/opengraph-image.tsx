import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'eMe — Moda Premium Argentina'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 112,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            eMe
          </div>
          <div style={{ width: 80, height: 2, background: '#c9a96e' }} />
          <div
            style={{
              fontSize: 22,
              color: '#c9a96e',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Moda Premium Argentina
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
