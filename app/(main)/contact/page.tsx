import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactate con LUXE. Atención al cliente, consultas sobre productos, pedidos y más. Respondemos en menos de 24 horas.',
  openGraph: {
    title: `Contacto — ${SITE_NAME}`,
    description: 'Contactate con nosotros. Respondemos todas las consultas en menos de 24 horas.',
    url: '/contact',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/contact` },
}

const CONTACT_ITEMS = [
  {
    label: 'Email',
    value: 'hola@luxe.com',
    href: 'mailto:hola@luxe.com',
    description: 'Respondemos en menos de 24 horas hábiles.',
  },
  {
    label: 'Teléfono / WhatsApp',
    value: '+54 11 1234-5678',
    href: 'https://wa.me/541112345678',
    description: 'Lunes a viernes de 10 a 18 hs.',
  },
  {
    label: 'Instagram',
    value: '@luxearg',
    href: 'https://instagram.com/luxearg',
    description: 'También podés escribirnos por DM.',
  },
]

export default function ContactPage() {
  return (
    <main>
      {/* ─── Header ─── */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              Contacto
            </p>
          </div>
          <h1
            className="mt-5 font-black uppercase leading-tight tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Estamos para ayudarte.
          </h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted">
            Tenés una consulta sobre un producto, un pedido o simplemente querés saber más sobre LUXE.
            Escribinos — respondemos todas las consultas.
          </p>
        </div>
      </section>

      {/* ─── Contact options ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} className="bg-background p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {item.label}
                </p>
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="mt-2 block text-[13px] font-semibold text-foreground transition-opacity hover:opacity-70"
                >
                  {item.value}
                </a>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Form ─── */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-[1fr_480px]">
            <div>
              <div className="mb-8 flex items-center gap-4">
                <div className="h-px w-8 bg-gold" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                  Envianos un mensaje
                </p>
              </div>
              <ContactForm />
            </div>
            <div className="hidden lg:block">
              <p className="text-[11px] text-muted">
                ¿Buscás información sobre envíos, talles o devoluciones?{' '}
                <a
                  href="/faq"
                  className="font-semibold text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  Revisá las preguntas frecuentes
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
