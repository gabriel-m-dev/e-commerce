import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'
import { getOrdersByEmail } from '@/lib/queries/orders'
import { formatPrice } from '@/lib/utils'

export const metadata = {
  title: 'Mi cuenta',
  description: 'Gestioná tu perfil, revisá el historial de pedidos y configurá tu cuenta en LUXE.',
  robots: { index: false },
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'text-muted border-border',
  PROCESSING: 'text-gold border-gold',
  SHIPPED: 'text-foreground border-foreground',
  DELIVERED: 'bg-foreground text-background border-foreground',
  CANCELLED: 'text-destructive border-destructive',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?callbackUrl=/account')
  }

  const name = user.user_metadata?.name ?? user.email
  const email = user.email
  const role = user.user_metadata?.role

  const orders = await getOrdersByEmail(email!)

  return (
    <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold mb-6">
        Cuenta
      </p>

      <hr className="border-border my-8" />

      {/* Perfil */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted mb-4">
          Perfil
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted w-16">
              Nombre
            </span>
            <span className="text-sm text-foreground">{name ?? '—'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted w-16">
              Email
            </span>
            <span className="text-sm text-foreground">{email ?? '—'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted w-16">
              Rol
            </span>
            {role === 'admin' ? (
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gold border border-gold px-2 py-0.5">
                Admin
              </span>
            ) : (
              <span className="text-sm text-foreground">{role ?? 'usuario'}</span>
            )}
          </div>
        </div>
      </section>

      <hr className="border-border my-8" />

      {/* Pedidos */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted mb-4">
          Mis pedidos
        </p>

        {orders.length === 0 ? (
          <div>
            <p className="text-sm text-muted">Aún no realizaste pedidos.</p>
            <Link
              href="/products"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground border border-foreground px-5 py-2.5 inline-flex items-center gap-2 mt-4 hover:bg-foreground hover:text-background transition-colors"
            >
              Ver productos →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id}>
                <hr className="border-gold h-px mb-4" />

                {/* Header: ID + status + date */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
                    N° {order.id.slice(0, 8).toUpperCase()}
                  </span>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.15em] border px-2 py-0.5 ${STATUS_CLASS[order.status] ?? 'text-muted border-border'}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>

                  <span className="text-[10px] text-muted ml-auto">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Items */}
                <p className="text-[11px] text-muted mb-1">
                  {order.items
                    .map((item) => `${item.name} ×${item.quantity}`)
                    .join('  |  ')}
                </p>

                {/* Total */}
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">
                  Total: {formatPrice(order.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr className="border-border my-8" />

      <LogoutButton />
    </div>
  )
}
