import Link from 'next/link'

type ShippingNoticeProps = {
  variant: 'pdp' | 'cart' | 'checkout'
}

export default function ShippingNotice({ variant }: ShippingNoticeProps) {
  const clockIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )

  if (variant === 'pdp') {
    return (
      <div className="flex items-center gap-2 text-[11px] text-muted">
        {clockIcon}
        <span>ENVÍOS EN 20 A 60 DÍAS HÁBILES</span>
        <span className="text-border">·</span>
        <Link
          href="/shipping"
          className="font-semibold uppercase tracking-[0.1em] text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
        >
          Ver más
        </Link>
      </div>
    )
  }

  return (
    <div
      className={`bg-surface border border-border px-4 py-3 ${
        variant === 'checkout' ? 'border-l-2 border-l-gold' : ''
      }`}
    >
      <div className="flex items-start gap-2.5 text-[11px] text-muted">
        {clockIcon}
        <div>
          <p className="font-semibold uppercase tracking-[0.12em] text-foreground">
            Envíos en 20 a 60 días hábiles
          </p>
          <p className="mt-1 leading-relaxed">
            El tiempo varía según el origen del producto y los procesos de aduana. Te notificamos por email en cada etapa.{' '}
            <Link
              href="/shipping"
              className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              Ver detalles
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
