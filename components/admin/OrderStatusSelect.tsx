'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { OrderStatus } from '@/lib/queries/orders'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING',          label: 'Pendiente'   },
  { value: 'CONFIRMED',        label: 'Confirmado'  },
  { value: 'PROCESSING',       label: 'En proceso'  },
  { value: 'SHIPPED',          label: 'Enviado'     },
  { value: 'OUT_FOR_DELIVERY', label: 'En reparto'  },
  { value: 'DELIVERED',        label: 'Entregado'   },
  { value: 'CANCELLED',        label: 'Cancelado'   },
]

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:          'text-muted',
  CONFIRMED:        'text-[#3b82f6]',
  PROCESSING:       'text-gold',
  SHIPPED:          'text-foreground',
  OUT_FOR_DELIVERY: 'text-[#f97316]',
  DELIVERED:        'text-foreground font-bold',
  CANCELLED:        'text-destructive',
}

export default function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string
  current: OrderStatus
}) {
  const router = useRouter()
  const [value, setValue] = useState<OrderStatus>(current)
  const [loading, setLoading] = useState(false)

  async function handleChange(next: OrderStatus) {
    if (next === value) return
    setLoading(true)
    const prev = value
    setValue(next)

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })

    setLoading(false)

    if (!res.ok) {
      setValue(prev)
      return
    }

    router.refresh()
  }

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className={`border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] focus:outline-none focus:border-foreground transition-colors disabled:opacity-50 ${STATUS_COLOR[value]}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
