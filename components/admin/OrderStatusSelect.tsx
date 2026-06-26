'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { OrderStatus } from '@/lib/queries/orders'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING',               label: 'Pendiente'          },
  { value: 'CONFIRMED',             label: 'Confirmado'         },
  { value: 'PROCESSING',            label: 'En proceso'         },
  { value: 'SHIPPED',               label: 'Enviado'            },
  { value: 'ARRIVED_COUNTRY',       label: 'Llegó al país'      },
  { value: 'CUSTOMS',               label: 'Proceso aduanero'   },
  { value: 'NATIONAL_DISTRIBUTION', label: 'Distribución nacional'},
  { value: 'OUT_FOR_DELIVERY',      label: 'En reparto'         },
  { value: 'DELIVERED',             label: 'Entregado'          },
  { value: 'CANCELLED',             label: 'Cancelado'          },
  { value: 'PENDING_TRANSFER',      label: 'Pend. Transferencia'},
]

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:               'text-muted',
  CONFIRMED:             'text-[#3b82f6]',
  PROCESSING:            'text-gold',
  SHIPPED:               'text-foreground',
  ARRIVED_COUNTRY:       'text-[#6366f1]',
  CUSTOMS:               'text-[#8b5cf6]',
  NATIONAL_DISTRIBUTION: 'text-[#f97316]',
  OUT_FOR_DELIVERY:      'text-[#f97316]',
  DELIVERED:             'text-foreground font-bold',
  CANCELLED:             'text-destructive',
  PENDING_TRANSFER:      'text-[#d97706]',
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
      <optgroup label="Preparación">
        {STATUS_OPTIONS.filter((o) => ['PENDING','CONFIRMED','PROCESSING'].includes(o.value)).map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </optgroup>
      <optgroup label="Envío internacional">
        {STATUS_OPTIONS.filter((o) => o.value === 'SHIPPED').map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </optgroup>
      <optgroup label="Llegó al país">
        {STATUS_OPTIONS.filter((o) => ['ARRIVED_COUNTRY','CUSTOMS'].includes(o.value)).map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </optgroup>
      <optgroup label="Distribución">
        {STATUS_OPTIONS.filter((o) => ['NATIONAL_DISTRIBUTION','OUT_FOR_DELIVERY'].includes(o.value)).map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </optgroup>
      <optgroup label="Final">
        {STATUS_OPTIONS.filter((o) => ['DELIVERED','CANCELLED'].includes(o.value)).map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </optgroup>
    </select>
  )
}
