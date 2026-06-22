'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const DELETABLE = ['PENDING', 'CANCELLED']

export default function DeleteOrderButton({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!DELETABLE.includes(status)) return null

  async function handleDelete() {
    if (!confirm(`¿Eliminar orden ${orderId.slice(0, 8).toUpperCase()}? Esta acción no se puede deshacer.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
      if (!res.ok) {
        const { error } = await res.json()
        alert(error ?? 'Error al eliminar')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[10px] uppercase tracking-[0.12em] text-destructive hover:text-destructive/70 transition-colors disabled:opacity-40"
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  )
}
