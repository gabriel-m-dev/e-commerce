'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#8a8a8a', margin: 0 }}>
            Error
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '16px 0 12px' }}>
            Algo salió mal.
          </h1>
          <p style={{ fontSize: 13, color: '#8a8a8a', margin: '0 0 32px', maxWidth: 360 }}>
            Ocurrió un error inesperado. Por favor, intentá de nuevo.
          </p>
          <button
            onClick={reset}
            style={{ border: '1px solid #0a0a0a', padding: '12px 28px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', background: 'transparent' }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
