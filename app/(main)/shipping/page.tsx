import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Envíos — eMe',
  description:
    'Los envíos de eMe toman entre 20 y 60 días hábiles. Conocé cómo funciona el proceso y cómo te mantenemos informado.',
  openGraph: {
    title: `Envíos — ${SITE_NAME}`,
    description:
      'Los envíos toman entre 20 y 60 días hábiles. Sin tracking automático — te avisamos por email en cada etapa.',
    url: '/shipping',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/shipping` },
}

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
            ¿CUÁNDO LLEGA MI PEDIDO?
          </h1>
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted">
            20 a 60 días hábiles desde la confirmación del pago. El tiempo varía según el
            origen del producto, el operador logístico y los procesos de aduana.
          </p>
        </div>
      </section>

      {/* ─── Cómo funciona ─── */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              ¿Cómo funciona?
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Realizás tu compra',
                text: 'Completás el formulario y confirmás el pago a través de Mercado Pago.',
              },
              {
                step: '02',
                title: 'Confirmamos el pago',
                text: 'Una vez verificado el pago, te enviamos una confirmación por email con el número de pedido.',
              },
              {
                step: '03',
                title: 'Gestionamos el pedido',
                text: 'Coordinamos el pedido con nuestros proveedores. Este proceso puede tomar varias semanas.',
              },
              {
                step: '04',
                title: 'Te notificamos',
                text: 'Cuando tu pedido se despacha, te avisamos por email con la información de envío disponible.',
              },
            ].map((s) => (
              <div key={s.step}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {s.step}
                </p>
                <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground">
                  {s.title}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Seguimiento ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Seguimiento
            </p>
          </div>
          <p className="max-w-xl text-[13px] leading-relaxed text-muted">
            No contamos con tracking automático. Te informamos por email en cada etapa del proceso: confirmación de pago, despacho del pedido y cualquier novedad relevante.
          </p>
        </div>
      </section>

      {/* ─── Preguntas ─── */}
      <section className="bg-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            ¿Tenés preguntas?
          </p>
          <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-background/70">
            Consultá nuestra sección de Preguntas Frecuentes o escribinos directamente.
          </p>
          <Link
            href="/faq"
            className="mt-6 inline-flex items-center gap-2 border border-background/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-70"
          >
            Ver preguntas frecuentes
          </Link>
        </div>
      </section>

    </main>
  )
}
