import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Cambios y devoluciones',
  description: 'Política de cambios y devoluciones de eMe. Tenés 30 días para solicitar un cambio o devolución. Proceso simple y rápido.',
  openGraph: {
    title: `Cambios y devoluciones — ${SITE_NAME}`,
    description: '30 días para cambiar o devolver. Proceso simple, sin complicaciones.',
    url: '/returns',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/returns` },
}

const STEPS = [
  {
    step: '01',
    title: 'Escribinos',
    description:
      'Enviá un email a hola@luxe.com con tu número de pedido, el producto que querés cambiar/devolver y el motivo.',
  },
  {
    step: '02',
    title: 'Confirmamos',
    description:
      'En menos de 24 horas hábiles te respondemos con las instrucciones y la etiqueta de envío de retorno (sin costo para vos).',
  },
  {
    step: '03',
    title: 'Enviás el producto',
    description:
      'Empacá el producto en su estado original (sin uso, con etiquetas) y despachalo con la etiqueta que te enviamos.',
  },
  {
    step: '04',
    title: 'Resolvemos',
    description:
      'Una vez que recibimos el producto, procesamos el cambio o la devolución en un plazo de 3 a 5 días hábiles.',
  },
]

export default function ReturnsPage() {
  return (
    <main>
      {/* ─── Header ─── */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Cambios y devoluciones
            </p>
          </div>
          <h1
            className="mt-5 font-black uppercase leading-tight tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Sin complicaciones.
          </h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted">
            Tenés 30 días desde la fecha de entrega para solicitar un cambio o devolución.
            El proceso es simple — te acompañamos en cada paso.
          </p>
        </div>
      </section>

      {/* ─── Conditions ─── */}
      <section className="bg-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-10 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            Condiciones
          </p>
          <p className="mt-2 text-[13px] text-background/70">
            El producto debe estar <span className="text-background font-semibold">sin uso, con sus etiquetas originales</span> y en su empaque. No se aceptan devoluciones de productos en liquidación marcados como &ldquo;sin cambio&rdquo;.
          </p>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="mb-12 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              ¿Cómo funciona?
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="border-t border-gold pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{s.step}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                  {s.title}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-screen-xl px-6 py-12 lg:px-10">
          <p className="text-[11px] text-muted">
            Para iniciar un cambio o devolución escribinos a{' '}
            <a
              href="mailto:hola@luxe.com"
              className="font-semibold text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              hola@luxe.com
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
