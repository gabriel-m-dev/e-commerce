import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Respondemos las preguntas más comunes sobre envíos, talles, devoluciones y pagos en LUXE.',
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
        a: 'Enviamos a todo el territorio argentino. El costo de envío se calcula en el checkout según la ubicación de entrega.',
      },
      {
        q: '¿Cuánto tarda el envío?',
        a: 'Los envíos tardan entre 20 y 60 días hábiles desde la confirmación del pago. El tiempo varía según el origen del producto y los procesos de aduana.',
      },
      {
        q: '¿El envío tiene costo?',
        a: 'El costo de envío se calcula en el checkout según la dirección de entrega.',
      },
    ],
  },
  {
    category: 'Productos y talles',
    questions: [
      {
        q: '¿Cómo sé qué talle elegir?',
        a: 'Cada producto tiene una guía de talles en la página de detalle. Te recomendamos medirte y comparar con la tabla antes de comprar.',
      },
      {
        q: '¿Los colores en pantalla son exactos?',
        a: 'Hacemos todo lo posible para que las fotos representen los colores reales. Sin embargo, puede haber variaciones leves según la calibración de tu pantalla.',
      },
      {
        q: '¿Tienen stock permanente?',
        a: 'Algunas prendas son de edición limitada. Si un producto te interesa, te recomendamos no esperar — cuando se agota no siempre vuelve.',
      },
    ],
  },
  {
    category: 'Pagos',
    questions: [
      {
        q: '¿Qué medios de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencia bancaria y pagos a través de MercadoPago.',
      },
      {
        q: '¿Puedo pagar en cuotas?',
        a: 'Sí. Las cuotas disponibles dependen del banco y el monto. En el checkout verás las opciones disponibles para tu tarjeta.',
      },
      {
        q: '¿Es seguro pagar en la web?',
        a: 'Sí. El proceso de pago está gestionado por MercadoPago y utiliza cifrado SSL. Nunca almacenamos datos de tarjetas.',
      },
    ],
  },
  {
    category: 'Cambios y devoluciones',
    questions: [
      {
        q: '¿Puedo cambiar talle o producto?',
        a: 'Sí. Tenés 30 días desde la recepción para solicitar un cambio, siempre que el producto esté sin uso, con etiquetas y en su empaque original.',
      },
      {
        q: '¿Cómo inicio una devolución?',
        a: 'Escribinos a hola@luxe.com con tu número de pedido y el motivo. Te respondemos en 24 horas con las instrucciones.',
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
              Escribinos a{' '}
              <a
                href="mailto:hola@luxe.com"
                className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                hola@luxe.com
              </a>
              {' '}y te respondemos a la brevedad.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
