'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/lib/queries/orders'
import { SUBSTATUS_OPTIONS } from '@/lib/order-status'

interface Props {
  orderId: string
  status: OrderStatus
  currentSubStatus: string | null
}

export function OrderSubStatusSelect({ orderId, status, currentSubStatus }: Props) {
  const router = useRouter()
  const options = SUBSTATUS_OPTIONS[status] ?? []
  const [value, setValue] = useState(currentSubStatus ?? '')
  const [loading, setLoading] = useState(false)

  if (options.length === 0) return null

  async function handleChange(next: string) {
    const prev = value
    setValue(next)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subStatus: next }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setValue(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        Subestado
      </p>
      <select
        value={value}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full border border-border bg-background text-foreground text-xs px-3 py-2 focus:outline-none focus:border-foreground disabled:opacity-50"
      >
        <option value="">— Sin subestado —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
