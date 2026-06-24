import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ArrowIcon from '@/components/ui/ArrowIcon'

export const metadata: Metadata = {
  title: 'Nuestra historia',
  description: 'Conocé la historia detrás de eMe. Empezamos en 2023 como hobby importando para amigos y familia, y crecimos hasta convertirnos en lo que somos hoy.',
  openGraph: {
    title: `Nuestra historia — ${SITE_NAME}`,
    description: 'Empezamos en 2023 importando para gente cercana. Hoy somos eMe.',
    url: '/about',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/about` },
}

const VALUES = [
  {
    label: 'Origen',
    description:
      'Arrancamos importando para amigos. Esa lógica — traer lo que vale la pena — sigue siendo la misma hoy.',
  },
  {
    label: 'Confianza',
    description:
      'Crecimos por recomendación. Cada cliente nuevo llegó porque alguien de confianza nos recomendó primero.',
  },
  {
    label: 'Criterio',
    description:
      'No vendemos todo. Elegimos lo que nosotros mismos usaríamos. Si no pasa ese filtro, no entra al catálogo.',
  },
]

export default function AboutPage() {
  return (
    <main>
      {/* ─── Hero ─── */}
      <section className="border-b border-border bg-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-24 lg:px-10 lg:py-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Nuestra historia
          </p>
          <h1
            className="mt-5 font-black uppercase leading-[0.9] tracking-tighter text-background"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Lo que empezó<br />entre amigos.
          </h1>
          <p className="mt-6 max-w-lg text-[13px] leading-relaxed text-background/60">
            eMe arrancó en 2023 como un hobby: importar indumentaria y zapatillas para gente
            cercana que buscaba calidad sin tener que salir a buscarla sola.
          </p>
        </div>
      </section>

      {/* ─── Story ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-gold" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                  El origen
                </p>
              </div>
              <p className="mt-6 text-[13px] leading-[1.8] text-muted">
                En 2023 empezamos a importar zapatillas e indumentaria para amigos y familia.
                Sin local, sin catálogo — solo pedidos por confianza y boca en boca.
                Lo que era un hobby fue creciendo solo, pedido a pedido.
              </p>
              <p className="mt-4 text-[13px] leading-[1.8] text-muted">
                Hoy eMe es una tienda online con catálogo propio, envíos a todo el país y
                una comunidad que confía en nosotros para traer lo que no se consigue fácil.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-gold" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                  La visión
                </p>
              </div>
              <p className="mt-6 text-[13px] leading-[1.8] text-muted">
                Seguir siendo el lugar al que recurre la gente cuando quiere algo que vale la pena.
                No la opción más ruidosa — la opción que no defrauda.
              </p>
              <p className="mt-4 text-[13px] leading-[1.8] text-muted">
                Cada producto que sumamos al catálogo pasa por el mismo filtro que usábamos
                al principio: ¿lo compraríamos nosotros? Si la respuesta es sí, entra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">
          <div className="mb-12 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Valores
            </p>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.label} className="bg-surface p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {v.label}
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-20 text-center lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            Explorá la colección
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-3 border border-foreground px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-opacity hover:opacity-70"
          >
            Ver productos <ArrowIcon className="text-gold" />
          </Link>
        </div>
      </section>
    </main>
  )
}
