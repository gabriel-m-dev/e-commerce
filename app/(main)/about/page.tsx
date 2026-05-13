import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ArrowIcon from '@/components/ui/ArrowIcon'

export const metadata: Metadata = {
  title: 'Nuestra historia',
  description: 'Conocé la historia detrás de LUXE. Una marca argentina de moda premium que combina diseño minimalista con calidad de primer nivel.',
  openGraph: {
    title: `Nuestra historia — ${SITE_NAME}`,
    description: 'Una marca argentina de moda premium. Diseño minimalista, calidad que se siente.',
    url: '/about',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/about` },
}

const VALUES = [
  {
    label: 'Diseño',
    description:
      'Cada pieza nace de un proceso de diseño riguroso. Formas limpias, proporciones exactas, materiales que duran.',
  },
  {
    label: 'Calidad',
    description:
      'Trabajamos con proveedores cuidadosamente seleccionados. Sin atajos, sin compromisos en la manufactura.',
  },
  {
    label: 'Identidad',
    description:
      'LUXE. no es una tendencia. Es una postura. Para quienes eligen lo que usan con intención.',
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
            Diseño que<br />tiene nombre.
          </h1>
          <p className="mt-6 max-w-lg text-[13px] leading-relaxed text-background/60">
            LUXE. nació de una idea simple: que la ropa de calidad no debería ser difícil de encontrar
            en Argentina. Que el diseño premium puede ser accesible sin perder su esencia.
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
                Empezamos en 2024 con una colección pequeña y una obsesión por los detalles.
                Cada prenda fue pensada para durar más de una temporada, para vivir en los
                armarios de personas que valoran lo que tienen.
              </p>
              <p className="mt-4 text-[13px] leading-[1.8] text-muted">
                Hoy somos una marca en crecimiento, con productos que combinan streetwear contemporáneo
                con materiales de primera selección y un proceso de diseño que no hace concesiones.
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
                Queremos ser la marca de referencia para quienes en Argentina buscan moda con
                identidad propia. No seguimos tendencias — las acompañamos con criterio.
              </p>
              <p className="mt-4 text-[13px] leading-[1.8] text-muted">
                Cada colección es una declaración de que el diseño y la calidad pueden coexistir
                sin que ninguno ceda terreno al otro.
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
