import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrderById } from '@/lib/queries/orders'
import { formatPrice } from '@/lib/utils'
import ArrowIcon from '@/components/ui/ArrowIcon'
import { CopyButton } from '@/components/ui/CopyButton'

export const dynamic = 'force-dynamic'

export default async function TransferInstructionsPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  const order = await getOrderById(orderId)
  if (!order) notFound()

  const cbu = process.env.TRANSFER_CBU
  const alias = process.env.TRANSFER_ALIAS
  const contact = process.env.TRANSFER_CONTACT ?? 'hola@emeimports.vercel.app'
  const whatsapp = process.env.TRANSFER_WHATSAPP

  const shortRef = `#${orderId.slice(0, 8).toUpperCase()}`
  const missingEnvVars = !cbu || !alias

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">

        {/* ─── Page header ─── */}
        <div className="border-b border-border py-8">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground"
          >
            eMe
          </Link>
        </div>

        <div className="py-12 lg:py-16 max-w-xl mx-auto">

          {/* ─── Heading ─── */}
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold mb-3">
              Pedido {shortRef}
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-2">
              Instrucciones de Pago
            </h1>
            <p className="text-[12px] text-muted leading-relaxed">
              Tu pedido fue registrado. Realizá la transferencia con los datos a continuación y envianos el comprobante para confirmar tu envío.
            </p>
          </div>

          {/* ─── Env var warning ─── */}
          {missingEnvVars && (
            <div className="mb-8 border border-destructive px-5 py-4 bg-background">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive mb-1">
                Datos bancarios no disponibles
              </p>
              <p className="text-[11px] text-muted leading-relaxed">
                Contactanos directamente para recibir el CBU y alias de transferencia.
              </p>
            </div>
          )}

          {/* ─── Transfer data block ─── */}
          {!missingEnvVars && (
            <div className="border border-border bg-surface mb-8">
              <div className="border-b border-border px-6 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Datos para transferir
                </span>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5">
                <TransferRow label="CBU" value={cbu!} mono copyable />
                <TransferRow label="Alias" value={alias!} mono copyable />
                <TransferRow
                  label="Monto a transferir"
                  value={formatPrice(order.total)}
                  highlight
                />
                <TransferRow
                  label="Concepto / Referencia"
                  value={shortRef}
                  mono
                  copyable
                  copyValue={shortRef.replace(/^#/, '')}
                />
              </div>
            </div>
          )}

          {/* ─── Contact block ─── */}
          <div className="border border-border px-6 py-5 mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted mb-3">
              Enviar comprobante
            </p>
            <p className="text-[12px] text-foreground leading-relaxed mb-4">
              Una vez realizada la transferencia, envianos el comprobante a:
            </p>
            <a
              href={`mailto:${contact}`}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold hover:underline"
            >
              {contact}
            </a>
            {whatsapp && (
              <div className="flex items-center gap-1 mt-2">
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola! Te envío el comprobante de pago para el pedido ${shortRef}. Monto transferido: ${formatPrice(order.total)}.`)}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold hover:underline"
                >
                  WhatsApp
                </a>
                <span className="text-xs text-muted">— hacé click para enviar el mensaje</span>
              </div>
            )}
            <p className="mt-2 text-[11px] text-muted">
              Incluí el número de referencia <span className="text-foreground font-semibold">{shortRef}</span> en el asunto.
            </p>
          </div>

          {/* ─── Back link ─── */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors"
          >
            <ArrowIcon size={14} className="shrink-0 rotate-180" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}

function TransferRow({
  label,
  value,
  mono = false,
  highlight = false,
  copyable = false,
  copyValue,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
  copyable?: boolean
  copyValue?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <span className="flex items-center gap-1">
        <span
          className={[
            highlight ? 'text-gold text-xl font-black' : 'text-foreground text-[13px] font-semibold',
            mono ? 'font-mono tracking-wider' : 'uppercase tracking-[0.08em]',
          ].join(' ')}
        >
          {value}
        </span>
        {copyable && <CopyButton value={copyValue ?? value} />}
      </span>
    </div>
  )
}
