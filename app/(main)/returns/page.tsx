import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Cambios y devoluciones',
  description: 'Política de cambios y devoluciones de eMe. Al ser productos importados, te pedimos que confirmes talla, color y modelo antes de hacer tu pedido.',
  openGraph: {
    title: `Cambios y devoluciones — ${SITE_NAME}`,
    description: 'Productos importados: confirmá talla y modelo antes de pedir. Estamos para ayudarte.',
    url: '/returns',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/returns` },
}

const CHECKLIST = [
  {
    label: 'Talle',
    description:
      'Revisá la guía de talles de cada producto. Si tenés dudas entre dos números, escribinos antes — te ayudamos a elegir.',
  },
  {
    label: 'Color',
    description:
      'Los colores en pantalla pueden variar levemente según el dispositivo. Si el color es importante para vos, consultanos y te mandamos fotos reales.',
  },
  {
    label: 'Modelo',
    description:
      'Confirmá el modelo exacto antes de hacer el pedido. Una vez ingresado al país, no podemos hacer cambios de producto.',
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
            Antes de pedir,<br />confirmá todo.
          </h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted">
            Todos nuestros productos son importados. Una vez que ingresan al país no podemos
            realizar cambios ni devoluciones — por eso queremos que tu pedido salga perfecto
            desde el principio.
          </p>
        </div>
      </section>

      {/* ─── Policy ─── */}
      <section className="bg-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-10 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            Política de cambios
          </p>
          <p className="mt-2 text-[13px] text-background/70">
            Al tratarse de{' '}
            <span className="font-semibold text-background">productos importados a pedido</span>,
            no aceptamos cambios ni devoluciones una vez que el producto ingresó al país.
            Te pedimos que revises bien talle, color y modelo antes de confirmar tu compra.
            Cualquier duda, estamos disponibles antes de que hagas el pedido.
          </p>
        </div>
      </section>

      {/* ─── Checklist ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="mb-12 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Qué revisar antes de pedir
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {CHECKLIST.map((item) => (
              <div key={item.label} className="border-t border-gold pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {item.label}
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-screen-xl px-6 py-12 lg:px-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground">
            ¿Tenés dudas antes de comprar?
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Escribinos antes de hacer tu pedido y te ayudamos con talles, colores y disponibilidad.
            Preferimos tomarnos el tiempo de asesorarte bien que no.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 border border-foreground px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-opacity hover:opacity-70"
          >
            Contactanos
          </Link>
        </div>
      </section>
    </main>
  )
}
