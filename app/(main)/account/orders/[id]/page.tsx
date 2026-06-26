import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getOrderById } from '@/lib/queries/orders'
import { OrderTimeline } from '@/components/account/OrderTimeline'
import { STATUS_LABEL } from '@/lib/order-status'
import AppImage from '@/components/ui/AppImage'
import { LocalDate } from '@/components/ui/LocalDate'
import Link from 'next/link'
import {
  ArrowLeft,
  Truck,
  MapPin,
  Receipt,
  Tag,
  MessageCircle,
  Package,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({
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

  const isOwner = order.email === user.email || (order.userId != null && order.userId === user.id)
  if (!order || !isOwner) {
    notFound()
  }

  const shortId = order.id.slice(0, 8).toUpperCase()
  const createdAt = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(order.createdAt))

  const statusLabel = STATUS_LABEL[order.status] ?? order.status

  const badgeStyles: Record<string, string> = {
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    PENDING_TRANSFER: 'bg-amber-50 text-amber-700 border-amber-200',
    PENDING: 'bg-[#fdf8f0] text-[#c9a96e] border-[#c9a96e]/30',
    CONFIRMED: 'bg-[#fdf8f0] text-[#c9a96e] border-[#c9a96e]/30',
    PROCESSING: 'bg-[#fdf8f0] text-[#c9a96e] border-[#c9a96e]/30',
    SHIPPED: 'bg-[#fdf8f0] text-[#c9a96e] border-[#c9a96e]/30',
    ARRIVED_COUNTRY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CUSTOMS: 'bg-violet-50 text-violet-700 border-violet-200',
    NATIONAL_DISTRIBUTION: 'bg-orange-50 text-orange-700 border-orange-200',
    OUT_FOR_DELIVERY: 'bg-[#fdf8f0] text-[#c9a96e] border-[#c9a96e]/30',
  }
  const badgeClass = badgeStyles[order.status] ?? 'bg-[#f5f5f5] text-[#8a8a8a] border-[#e5e5e5]'

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Back link */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis pedidos
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#0a0a0a] tracking-wide uppercase">
                Pedido #{shortId}
              </h1>
              <p className="text-sm text-[#8a8a8a] mt-0.5">Realizado el {createdAt}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border ${badgeClass}`}
              >
                {statusLabel}
              </span>
              <span className="text-[11px] text-[#8a8a8a]">
                Últ. act.: <LocalDate
                  date={order.updatedAt.toISOString()}
                  options={{ day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }}
                />
              </span>
            </div>
          </div>
        </div>

        {/* Timeline card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8a8a8a] mb-5">
            Estado del pedido
          </h2>
          <OrderTimeline
            status={order.status}
            subStatus={order.subStatus}
            subStatusHistory={order.subStatusHistory}
            updatedAt={order.updatedAt}
          />
        </div>

        {/* Tracking number card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4 text-[#c9a96e]" />
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0a0a0a] mb-1">
                Número de seguimiento
              </h2>
              {order.trackingNumber ? (
                <p className="text-sm font-mono font-semibold text-[#0a0a0a]">
                  {order.trackingNumber}
                </p>
              ) : (
                <p className="text-sm text-[#0a0a0a]">
                  El número de seguimiento estará disponible cuando el pedido sea despachado.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Products card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8a8a8a] mb-4">
            Productos
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-[#e5e5e5]">
                  {item.image ? (
                    <AppImage
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#8a8a8a]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0a0a0a] leading-snug">{item.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {item.size && (
                      <span className="text-sm text-[#8a8a8a]">Talle: {item.size}</span>
                    )}
                    <span className="text-sm text-[#8a8a8a]">Cantidad: {item.quantity}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#0a0a0a] flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8a8a8a] mb-4">
            Resumen
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#8a8a8a]">
                <Receipt className="w-4 h-4" />
                Subtotal
              </div>
              <span className="text-sm text-[#0a0a0a]">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#8a8a8a]">
                <Truck className="w-4 h-4" />
                Envío
              </div>
              <span className="text-sm text-[#0a0a0a]">{formatPrice(order.shipping)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Tag className="w-4 h-4" />
                  Descuento
                </div>
                <span className="text-sm text-green-600">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="border-t border-[#e5e5e5] pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#0a0a0a] uppercase tracking-wide">Total</span>
              <span className="text-lg font-bold text-[#c9a96e]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address card */}
        {order.address && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[#c9a96e]" />
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8a8a8a] mb-1">
                  Dirección de entrega
                </h2>
                <p className="text-sm font-semibold text-[#0a0a0a]">{order.address.name}</p>
                <p className="text-sm text-[#8a8a8a] mt-0.5">{order.address.street}</p>
                <p className="text-sm text-[#8a8a8a]">
                  {order.address.city}, {order.address.state} {order.address.zipCode}
                </p>
                <p className="text-sm text-[#8a8a8a]">{order.address.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Support button — desktop only */}
        <div className="hidden md:block">
          <a
            href="#"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#0a0a0a] text-white text-sm font-semibold uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar soporte
          </a>
        </div>
      </div>

      {/* Support button — mobile fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#e5e5e5] md:hidden">
        <a
          href="#"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#0a0a0a] text-white text-sm font-semibold uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Contactar soporte
        </a>
      </div>
    </div>
  )
}
