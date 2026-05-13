import { ImageResponse } from 'next/og'
import { getProductBySlug } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function ProductOGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0a0a0a',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em' }}>
            {SITE_NAME}
          </div>
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        {/* Left panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 56px',
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#c9a96e',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              {product.category}
            </div>
            <div
              style={{
                fontSize: product.name.length > 25 ? 44 : 54,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                marginTop: 16,
              }}
            >
              {product.name}
            </div>
            <div style={{ width: 56, height: 2, background: '#c9a96e', marginTop: 28 }} />
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#ffffff',
                marginTop: 20,
              }}
            >
              {formatPrice(product.price)}
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.25em',
            }}
          >
            LUXE.
          </div>
        </div>

        {/* Right panel — product image */}
        <div style={{ width: 480, position: 'relative', display: 'flex' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, #0a0a0a 0%, transparent 35%)',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
