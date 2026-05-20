import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'
import { getOrdersByUserId } from '@/lib/queries/orders'
import { formatPrice } from '@/lib/utils'

export const metadata = {
  title: 'Mi cuenta',
  description: 'Gestioná tu perfil, revisá el historial de pedidos y configurá tu cuenta en LUXE.',
  robots: { index: false },
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'PENDIENTE',
  PROCESSING: 'EN PROCESO',
  SHIPPED: 'ENVIADO',
  DELIVERED: 'ENTREGADO',
  CANCELLED: 'CANCELADO',
}

const STATUS_BG: Record<string, string> = {
  PENDING: 'bg-black text-white',
  PROCESSING: 'bg-yellow-400 text-black',
  SHIPPED: 'bg-yellow-400 text-black',
  DELIVERED: 'bg-green-600 text-white',
  CANCELLED: 'bg-red-600 text-white',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?callbackUrl=/account')
  }

  const name = user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? ''
  const email = user.email ?? ''
  const avatarUrl: string | null =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null

  const orders = await getOrdersByUserId(user.id, email)

  return (
    <div className="bg-white pt-8 md:pt-12 pb-24 px-6 max-w-2xl mx-auto">

      {/* ─── Page label ─── */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
          Mi Cuenta
        </p>
        <LogoutButton className="bg-white text-black border border-black px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold rounded-sm hover:bg-black hover:text-white transition-colors" />
      </div>

      {/* ─── Profile header ─── */}
      <section className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8 pb-8 border-b border-border">
        {/* Avatar */}
        {avatarUrl ? (
          <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full overflow-hidden border border-border">
            <Image
              src={avatarUrl}
              alt={name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-surface border border-border flex items-center justify-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-muted">
              {getInitials(name)}
            </span>
          </div>
        )}

        {/* Identity */}
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold uppercase tracking-[0.12em] text-foreground leading-tight">
            {name}
          </p>
          <p className="text-[11px] text-muted tracking-wide">{email}</p>
        </div>
      </section>

      {/* ─── Orders ─── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-6 h-px bg-gold" aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground">
            Mis Pedidos
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="pt-2">
            <p className="text-sm text-muted mb-5">Aún no realizaste pedidos.</p>
            <Link
              href="/products"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground border border-foreground px-6 py-3 inline-flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => {
              const firstImage = order.items[0]?.image ?? null

              return (
                <div key={order.id} className="py-6 flex gap-4">
                  {/* Product thumbnail */}
                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-surface border border-border overflow-hidden">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={order.items[0]?.name ?? 'Producto'}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          className="text-border"
                          aria-hidden
                        >
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Order info */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Order ID + status */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] rounded-none ${STATUS_BG[order.status] ?? 'bg-[#8a8a8a] text-white'}`}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>

                    {/* Items summary */}
                    <p className="text-[11px] text-muted truncate">
                      {order.items.map((item) => `${item.name} ×${item.quantity}`).join('  ·  ')}
                    </p>

                    {/* Date + total */}
                    <div className="flex items-center gap-4 mt-0.5">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}
