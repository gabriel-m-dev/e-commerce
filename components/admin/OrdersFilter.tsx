'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { OrderStatus } from '@/lib/queries/orders'

const TABS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',        label: 'Todos'      },
  { value: 'PENDING',    label: 'Pendiente'  },
  { value: 'PROCESSING', label: 'En proceso' },
  { value: 'SHIPPED',    label: 'Enviado'    },
  { value: 'DELIVERED',  label: 'Entregado'  },
  { value: 'CANCELLED',  label: 'Cancelado'  },
]

export default function OrdersFilter({ counts }: { counts: Record<string, number> }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? 'ALL'

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'ALL') params.delete('status')
    else params.set('status', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {TABS.map(({ value, label }) => {
        const count = value === 'ALL'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[value] ?? 0)
        const active = current === value

        return (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={[
              'px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors border-b-2 -mb-px',
              active
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted hover:text-foreground',
            ].join(' ')}
          >
            {label}
            {count > 0 && (
              <span className={`ml-1.5 text-[9px] ${active ? 'text-foreground' : 'text-muted'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
