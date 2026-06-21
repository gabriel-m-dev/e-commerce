import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/queries/orders'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  PENDING:          'PENDIENTE',
  CONFIRMED:        'CONFIRMADO',
  PROCESSING:       'EN PROCESO',
  SHIPPED:          'ENVIADO',
  OUT_FOR_DELIVERY: 'EN REPARTO',
  DELIVERED:        'ENTREGADO',
  CANCELLED:        'CANCELADO',
}

const STATUS_BG: Record<string, string> = {
  PENDING:          'bg-black text-white',
  CONFIRMED:        'bg-blue-500 text-white',
  PROCESSING:       'bg-yellow-400 text-black',
  SHIPPED:          'bg-yellow-400 text-black',
  OUT_FOR_DELIVERY: 'bg-orange-500 text-white',
  DELIVERED:        'bg-green-600 text-white',
  CANCELLED:        'bg-red-600 text-white',
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?callbackUrl=/account/orders/${id}`)
  }

  const order = await getOrderById(id)

  if (!order || order.email !== user.email) {
    notFound()
  }

  const shortId = order.id.slice(0, 8).toUpperCase()
  const statusLabel = STATUS_LABEL[order.status] ?? order.status.toUpperCase()
  const statusBg = STATUS_BG[order.status] ?? 'bg-[#8a8a8a] text-white'

  return (
    <div className="bg-white pt-8 md:pt-12 pb-24 px-6 max-w-2xl mx-auto">

      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/account"
          className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors"
        >
          &larr; Mis pedidos
        </Link>
      </div>

      {/* Order header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-8 border-b border-border">
        <div>
          <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
            #{shortId}
          </h1>
        </div>
        <span
          className={`inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${statusBg}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Tracking number */}
      {order.trackingNumber ? (
        <div className="bg-surface border border-border px-5 py-4 mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted mb-1">
            Número de seguimiento
          </p>
          <p className="text-[13px] font-semibold text-foreground">{order.trackingNumber}</p>
        </div>
      ) : (
        <div className="bg-surface border border-border px-5 py-4 mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted mb-1">
            Número de seguimiento
          </p>
          <p className="text-[12px] text-muted">Número de seguimiento no disponible aún</p>
        </div>
      )}

      {/* Products */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground mb-4">
          Productos
        </p>
        <div className="divide-y divide-border border border-border">
          {order.items.map((item) => (
            <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground truncate">
                  {item.name}
                </p>
                {item.size && (
                  <p className="text-[10px] text-muted mt-0.5 uppercase tracking-[0.08em]">
                    Talle: {item.size}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-muted">×{item.quantity}</p>
                <p className="text-[11px] font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border border-border p-5 mb-8 space-y-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted uppercase tracking-[0.1em]">Subtotal</span>
          <span className="text-foreground">{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted uppercase tracking-[0.1em]">Envio</span>
          <span className="text-foreground">
            {order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}
          </span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between text-[12px]">
          <span className="font-black uppercase tracking-[0.14em] text-foreground">Total</span>
          <span className="font-black text-foreground">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Delivery address */}
      {order.address && (
        <div className="border border-border p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted mb-3">
            Dirección de entrega
          </p>
          <address className="not-italic space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground">
              {order.address.name}
            </p>
            <p className="text-[11px] text-muted">{order.address.street}</p>
            <p className="text-[11px] text-muted">
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
            <p className="text-[11px] text-muted">{order.address.country}</p>
          </address>
        </div>
      )}

    </div>
  )
}
