'use client'

import { useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { OrderStatus } from '@/lib/queries/orders'

const TABS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',              label: 'Todos'           },
  { value: 'PENDING',          label: 'Pendiente'       },
  { value: 'PENDING_TRANSFER', label: 'Transferencia'   },
  { value: 'CONFIRMED',        label: 'Confirmado'      },
  { value: 'PROCESSING',       label: 'En proceso'      },
  { value: 'SHIPPED',               label: 'Enviado'         },
  { value: 'ARRIVED_COUNTRY',       label: 'Llegó al país'   },
  { value: 'CUSTOMS',               label: 'Aduanas'         },
  { value: 'NATIONAL_DISTRIBUTION', label: 'Distribución'    },
  { value: 'OUT_FOR_DELIVERY',      label: 'En reparto'      },
  { value: 'DELIVERED',        label: 'Entregado'       },
  { value: 'CANCELLED',        label: 'Cancelado'       },
]

export default function OrdersFilter({ counts }: { counts: Record<string, number> }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? 'ALL'
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'ALL') params.delete('status')
    else params.set('status', value)
    // Preserve ?q= when switching status tabs
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      // Reset cursor when search changes
      params.delete('cursor')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)
  }

  return (
    <div className="border-b border-border">
      <div className="flex flex-wrap gap-1">
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

      <div className="px-4 py-3">
        <input
          type="search"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={handleSearch}
          placeholder="Buscar por email o N de orden..."
          className="w-full max-w-sm border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors"
        />
      </div>
    </div>
  )
}
