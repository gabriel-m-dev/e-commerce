'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfirmTransferButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-transfer`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Error al confirmar el pago')
        return
      }
      router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 bg-gold text-background text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Confirmando...' : 'Confirmar pago por transferencia'}
      </button>
      {error && (
        <p className="text-[11px] text-destructive uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
    </div>
  )
}
