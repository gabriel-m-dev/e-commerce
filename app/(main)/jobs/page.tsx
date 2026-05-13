import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ArrowIcon from '@/components/ui/ArrowIcon'

export const metadata: Metadata = {
  title: 'Trabajá con nosotros',
  description: 'Sumate al equipo LUXE. Buscamos personas apasionadas por el diseño, la moda y la tecnología para construir la mejor marca de moda premium de Argentina.',
  openGraph: {
    title: `Trabajá con nosotros — ${SITE_NAME}`,
    description: 'Sumate al equipo. Buscamos personas apasionadas por el diseño y la moda.',
    url: '/jobs',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/jobs` },
}

const OPEN_ROLES: { title: string; area: string; type: string }[] = [
  // Descomentar cuando haya posiciones abiertas:
  // { title: 'Diseñador/a de producto', area: 'Diseño', type: 'Full-time' },
]

const VALUES = [
  { label: 'Autonomía', description: 'Confiamos en las personas. Trabajamos con objetivos, no con horarios.' },
  { label: 'Calidad antes que velocidad', description: 'Preferimos hacer bien las cosas que hacerlas rápido.' },
  { label: 'Impacto real', description: 'En un equipo chico cada persona mueve la aguja. Acá se nota lo que hacés.' },
]

export default function JobsPage() {
  return (
    <main>
      {/* ─── Header ─── */}
      <section className="border-b border-border bg-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-24 lg:px-10 lg:py-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Carreras
          </p>
          <h1
            className="mt-5 font-black uppercase leading-[0.9] tracking-tighter text-background"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Construí LUXE.<br />con nosotros.
          </h1>
          <p className="mt-6 max-w-lg text-[13px] leading-relaxed text-background/60">
            Somos un equipo pequeño con grandes ambiciones. Si te apasiona la moda, el diseño
            o la tecnología y querés construir algo que importe, este es tu lugar.
          </p>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">
          <div className="mb-12 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Cómo trabajamos
            </p>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.label} className="bg-background p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{v.label}</p>
                <p className="mt-3 text-[12px] leading-relaxed text-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Open roles ─── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Posiciones abiertas
            </p>
          </div>

          {OPEN_ROLES.length > 0 ? (
            <div className="divide-y divide-border border border-border">
              {OPEN_ROLES.map((role) => (
                <div key={role.title} className="flex items-center justify-between px-6 py-5">
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{role.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{role.area} · {role.type}</p>
                  </div>
                  <ArrowIcon className="text-gold" />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-background p-10 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                No hay posiciones abiertas en este momento.
              </p>
              <p className="mt-2 text-[12px] text-muted">
                Igual podés enviarnos tu CV — siempre estamos abiertos a conocer gente talentosa.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
            ¿No encontraste tu posición?
          </p>
          <p className="mt-2 text-[12px] text-muted">
            Mandanos tu CV a{' '}
            <a
              href="mailto:hola@luxe.com?subject=Postulación espontánea"
              className="font-semibold text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              hola@luxe.com
            </a>
            {' '}con el asunto &ldquo;Postulación espontánea&rdquo;.
          </p>
        </div>
      </section>
    </main>
  )
}
