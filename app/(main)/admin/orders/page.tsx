import { Suspense } from 'react'
import { getAllOrders } from '@/lib/queries/orders'
import { formatPrice } from '@/lib/utils'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'
import TrackingNumberInput from '@/components/admin/TrackingNumberInput'
import OrdersFilter from '@/components/admin/OrdersFilter'
import type { OrderStatus } from '@/lib/queries/orders'

export const dynamic = 'force-dynamic'

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const activeStatus = VALID_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined

  const [allOrders, filteredOrders] = await Promise.all([
    getAllOrders(),
    activeStatus ? getAllOrders(activeStatus) : Promise.resolve(null),
  ])

  const orders = filteredOrders ?? allOrders

  const counts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
          Órdenes
        </h1>
        <p className="mt-1 text-[11px] text-muted">
          {allOrders.length} {allOrders.length === 1 ? 'pedido' : 'pedidos'} en total
        </p>
      </div>

      <div className="border border-border bg-background">
        <Suspense>
          <OrdersFilter counts={counts} />
        </Suspense>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  N° Orden
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Cliente
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Estado
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Tracking
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center border border-border">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted"
                          aria-hidden
                        >
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                          <rect x="9" y="3" width="6" height="4" rx="1" />
                          <line x1="9" y1="12" x2="15" y2="12" />
                          <line x1="9" y1="16" x2="13" y2="16" />
                        </svg>
                      </div>
                      <p className="text-[12px] font-black uppercase tracking-[0.18em] text-foreground">
                        Sin órdenes{activeStatus ? ' con este estado' : ' aún'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-surface">
                    <td className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-3 text-[11px] text-muted">
                      {order.email}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3 text-[11px] text-muted max-w-[200px] truncate">
                      {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </td>
                    <td className="px-6 py-3 text-[12px] font-semibold text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <OrderStatusSelect orderId={order.id} current={order.status} />
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3">
                      <TrackingNumberInput orderId={order.id} current={order.trackingNumber} />
                    </td>
                    <td className="hidden sm:table-cell px-6 py-3 text-[11px] text-muted">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
