import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrderById } from '@/lib/queries/orders'
import { formatPrice } from '@/lib/utils'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'

export const dynamic = 'force-dynamic'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:          'Pendiente',
  CONFIRMED:        'Confirmado',
  PROCESSING:       'En proceso',
  SHIPPED:          'Enviado',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED:        'Entregado',
  CANCELLED:        'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:          'text-muted border-muted',
  CONFIRMED:        'text-[#3b82f6] border-[#3b82f6]',
  PROCESSING:       'text-gold border-gold',
  SHIPPED:          'text-foreground border-foreground',
  OUT_FOR_DELIVERY: 'text-[#f97316] border-[#f97316]',
  DELIVERED:        'text-foreground border-foreground font-bold',
  CANCELLED:        'text-destructive border-destructive',
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { id } = await params
  const { status: statusParam, q } = await searchParams

  const order = await getOrderById(id)
  if (!order) notFound()

  // Build back link that preserves list filters
  const backParams = new URLSearchParams()
  if (statusParam) backParams.set('status', statusParam)
  if (q) backParams.set('q', q)
  const backHref = `/admin/orders${backParams.toString() ? `?${backParams.toString()}` : ''}`

  const subtotal = order.subtotal
  const shipping = order.shipping
  const total = order.total

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <div>
        <Link
          href={backHref}
          className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors"
        >
          &larr; Volver a ordenes
        </Link>
      </div>

      {/* Order header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
            Orden #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-[11px] text-muted">{formatDate(order.createdAt)}</p>
          <p className="mt-0.5 text-[11px] text-muted">{order.email}</p>
          <p className="mt-0.5 text-[11px] text-muted">{order.address?.name ?? '—'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${STATUS_COLOR[order.status] ?? 'text-muted border-muted'}`}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          {order.trackingNumber && (
            <span className="text-[10px] text-muted">
              Tracking: <span className="text-foreground font-semibold">{order.trackingNumber}</span>
            </span>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="border border-border">
        <div className="border-b border-border bg-surface px-6 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Productos
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-muted">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-muted">
                  Talle
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-muted">
                  Color
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-muted">
                  Cant.
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-muted">
                  P. Unit.
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.15em] text-muted">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover border border-border flex-shrink-0"
                        />
                      )}
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-muted">
                    {item.size ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-[11px] text-muted">
                    {item.color ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-[11px] text-foreground">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-[11px] text-foreground">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-6 py-4 text-right text-[11px] font-semibold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Address + Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Address block */}
        <div className="border border-border p-6 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Direccion de envio
          </p>
          {order.address ? (
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
          ) : (
            <p className="text-[11px] text-muted">Sin direccion registrada</p>
          )}
        </div>

        {/* Totals block */}
        <div className="border border-border p-6 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Resumen
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted uppercase tracking-[0.1em]">Subtotal</span>
              <span className="text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted uppercase tracking-[0.1em]">Envío</span>
              <span className="text-foreground">{formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-[12px]">
              <span className="font-black uppercase tracking-[0.14em] text-foreground">Total</span>
              <span className="font-black text-foreground">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status change island */}
      <div className="border border-border p-6 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Cambiar estado
        </p>
        <OrderStatusSelect orderId={order.id} current={order.status} />
      </div>
    </div>
  )
}
