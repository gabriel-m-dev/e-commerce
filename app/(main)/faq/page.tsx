import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Respondemos las preguntas más comunes sobre envíos, talles, devoluciones y pagos en eMe.',
  openGraph: {
    title: `Preguntas frecuentes — ${SITE_NAME}`,
    description: 'Todo lo que necesitás saber sobre envíos, talles, devoluciones y pagos.',
    url: '/faq',
    type: 'website',
  },
  alternates: { canonical: `${SITE_URL}/faq` },
}

const FAQ_ITEMS = [
  {
    category: 'Envíos',
    questions: [
      {
        q: '¿A dónde envían?',
        a: 'Enviamos a todo el territorio argentino. El costo de envío se calcula en el checkout según tu dirección de entrega.',
      },
      {
        q: '¿Cuánto tarda el envío?',
        a: 'Entre 20 y 60 días hábiles desde la confirmación del pago. El tiempo varía según el origen del producto y los tiempos de aduana. Te avisamos cuando tu pedido esté en camino.',
      },
      {
        q: '¿El envío tiene costo?',
        a: 'El costo se calcula en el checkout según tu ubicación. Lo ves antes de confirmar el pago.',
      },
      {
        q: '¿Puedo rastrear mi pedido?',
        a: 'Sí. Una vez despachado te enviamos el número de seguimiento para que puedas ver el estado en tiempo real.',
      },
    ],
  },
  {
    category: 'Productos y talles',
    questions: [
      {
        q: '¿Cómo sé qué talle elegir?',
        a: 'Cada producto tiene una guía de talles en su página de detalle. Te recomendamos medirte y comparar con la tabla antes de pedir. Si tenés dudas, escribinos — te ayudamos a elegir antes de que hagas el pedido.',
      },
      {
        q: '¿Los colores en pantalla son exactos?',
        a: 'Hacemos todo lo posible para que las fotos sean fieles al producto real, pero puede haber variaciones leves según la pantalla. Si el color es importante para vos, consultanos antes de comprar y te mandamos más fotos.',
      },
      {
        q: '¿Tienen stock permanente?',
        a: 'No siempre. Muchos productos son importados a pedido o en cantidades limitadas. Si algo te interesa, no lo dejes para después — cuando se agota, no garantizamos reposición.',
      },
      {
        q: '¿Puedo consultar por un producto que no está en el catálogo?',
        a: 'Sí. Si buscás algo puntual que no ves en la tienda, escribinos y vemos si podemos conseguirlo.',
      },
    ],
  },
  {
    category: 'Pagos',
    questions: [
      {
        q: '¿Qué medios de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex) a través de MercadoPago, y transferencia bancaria con 6% de descuento.',
      },
      {
        q: '¿Puedo pagar en cuotas?',
        a: 'Sí, con tarjeta de crédito a través de MercadoPago. Las cuotas disponibles dependen del banco y el monto — las ves en el checkout antes de confirmar.',
      },
      {
        q: '¿Cómo funciona el descuento por transferencia?',
        a: 'Elegís "Pago por transferencia" en el checkout y obtenés un 6% de descuento sobre el total. Una vez que confirmamos la acreditación, procesamos tu pedido.',
      },
      {
        q: '¿Es seguro pagar en la web?',
        a: 'Sí. El pago con tarjeta está gestionado por MercadoPago con cifrado SSL. Nunca almacenamos datos de tarjetas en nuestros servidores.',
      },
    ],
  },
  {
    category: 'Cambios y devoluciones',
    questions: [
      {
        q: '¿Aceptan cambios o devoluciones?',
        a: 'Al ser productos importados a pedido, no podemos aceptar cambios ni devoluciones una vez que el producto ingresó al país. Por eso te pedimos que confirmes bien el talle, color y modelo antes de hacer tu pedido.',
      },
      {
        q: '¿Qué pasa si el producto llega con un defecto de fábrica?',
        a: 'En ese caso sí te ayudamos. Escribinos con fotos del producto y el número de pedido, y buscamos la mejor solución.',
      },
      {
        q: '¿Cómo evito equivocarme al pedir?',
        a: 'Escribinos antes de comprar. Podemos asesorarte en talle, mostrarte más fotos o confirmar disponibilidad. Preferimos tomarnos ese tiempo que no.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main>
      {/* ─── Header ─── */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              FAQ
            </p>
          </div>
          <h1
            className="mt-5 font-black uppercase leading-tight tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Preguntas frecuentes.
          </h1>
        </div>
      </section>

      {/* ─── Questions ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="space-y-16">
            {FAQ_ITEMS.map((section) => (
              <div key={section.category}>
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-px w-8 bg-gold" aria-hidden />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                    {section.category}
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {section.questions.map((item) => (
                    <div key={item.q} className="py-6">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">
                        {item.q}
                      </p>
                      <p className="mt-3 text-[12px] leading-relaxed text-muted">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ─── Still need help ─── */}
          <div className="mt-20 border-t border-border pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              ¿No encontraste tu respuesta?
            </p>
            <p className="mt-2 text-[12px] text-muted">
              Pasate por nuestra{' '}
              <a
                href="/contact"
                className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                página de contacto
              </a>
              {' '}y te respondemos a la brevedad.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
