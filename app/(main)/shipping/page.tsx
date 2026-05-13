import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Envíos',
  description: 'Información sobre envíos de LUXE. Zonas de cobertura, tiempos de entrega y costos. Envío gratis en compras mayores a $50.000 ARS.',
  openGraph: {
    title: `Envíos — ${SITE_NAME}`,
    description: 'Cobertura nacional, seguimiento en tiempo real. Envío gratis en compras mayores a $50.000 ARS.',
    url: '/shipping',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/shipping` },
}

const ZONES = [
  {
    zone: 'CABA',
    time: '24 – 48 hs hábiles',
    cost: 'Gratis en compras +$50.000',
  },
  {
    zone: 'Gran Buenos Aires',
    time: '24 – 72 hs hábiles',
    cost: 'Gratis en compras +$50.000',
  },
  {
    zone: 'Provincia de Buenos Aires',
    time: '2 – 4 días hábiles',
    cost: 'Varía según localidad',
  },
  {
    zone: 'Interior del país',
    time: '3 – 7 días hábiles',
    cost: 'Varía según distancia',
  },
]

export default function ShippingPage() {
  return (
    <main>
      {/* ─── Header ─── */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Envíos
            </p>
          </div>
          <h1
            className="mt-5 font-black uppercase leading-tight tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Llegamos a todo el país.
          </h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted">
            Trabajamos con empresas de logística líderes para garantizar que tu pedido llegue
            en perfectas condiciones y con seguimiento en tiempo real.
          </p>
        </div>
      </section>

      {/* ─── Free shipping highlight ─── */}
      <section className="bg-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-10 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            Envío gratis
          </p>
          <p className="mt-2 text-[13px] text-background/70">
            En todas las compras mayores a{' '}
            <span className="font-semibold text-background">$50.000 ARS</span> — sin excepciones.
          </p>
        </div>
      </section>

      {/* ─── Zones table ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Tiempos de entrega
            </p>
          </div>

          <div className="divide-y divide-border border border-border">
            {/* Header row */}
            <div className="grid grid-cols-3 bg-surface px-6 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Zona</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Plazo estimado</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Costo</p>
            </div>
            {ZONES.map((z) => (
              <div key={z.zone} className="grid grid-cols-3 px-6 py-4">
                <p className="text-[12px] font-semibold text-foreground">{z.zone}</p>
                <p className="text-[12px] text-muted">{z.time}</p>
                <p className="text-[12px] text-muted">{z.cost}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-muted">
            * Los plazos son estimados y pueden extenderse en períodos de alta demanda o feriados nacionales.
          </p>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              ¿Cómo funciona?
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', text: 'Confirmás tu compra y recibís un email con el número de pedido.' },
              { step: '02', text: 'En 24 hs hábiles preparamos y despachamos tu paquete.' },
              { step: '03', text: 'Recibís el código de seguimiento para rastrear tu pedido en tiempo real.' },
            ].map((s) => (
              <div key={s.step}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{s.step}</p>
                <p className="mt-3 text-[12px] leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
