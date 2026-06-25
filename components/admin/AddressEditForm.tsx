'use client'

import { useState } from 'react'

type Address = {
  name: string
  phone: string | null
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

const FIELD_LABEL: Record<keyof Address, string> = {
  name: 'Nombre',
  phone: 'Teléfono',
  street: 'Dirección',
  city: 'Ciudad',
  state: 'Provincia',
  zipCode: 'CP',
  country: 'País',
}

const INPUT = 'w-full border border-border bg-surface px-3 py-2 text-[11px] text-foreground focus:outline-none focus:border-foreground'
const LABEL = 'text-[10px] font-semibold uppercase tracking-[0.15em] text-muted'

export default function AddressEditForm({
  orderId,
  address,
}: {
  orderId: string
  address: Address | null
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Address>({
    name: address?.name ?? '',
    phone: address?.phone ?? '',
    street: address?.street ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    zipCode: address?.zipCode ?? '',
    country: address?.country ?? '',
  })
  const [saved, setSaved] = useState<Address | null>(address)

  function set(key: keyof Address, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: form }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar')
        return
      }
      setSaved({ ...form })
      setEditing(false)
    } catch {
      setError('Error de red')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="space-y-1">
        {saved ? (
          <>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground">{saved.name}</p>
            {saved.phone ? (
              <p className="text-[11px] text-muted">{saved.phone}</p>
            ) : (
              <p className="text-[11px] text-destructive uppercase tracking-[0.08em]">Sin teléfono</p>
            )}
            <p className="text-[11px] text-muted">{saved.street}</p>
            <p className="text-[11px] text-muted">{saved.city}, {saved.state} {saved.zipCode}</p>
            <p className="text-[11px] text-muted">{saved.country}</p>
          </>
        ) : (
          <p className="text-[11px] text-muted">Sin dirección registrada</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold hover:text-foreground transition-colors"
        >
          Editar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {(Object.keys(FIELD_LABEL) as (keyof Address)[]).map((key) => (
        <div key={key}>
          <label className={LABEL}>{FIELD_LABEL[key]}</label>
          <input
            type="text"
            value={form[key] ?? ''}
            onChange={(e) => set(key, e.target.value)}
            className={INPUT}
          />
        </div>
      ))}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[10px] font-semibold uppercase tracking-[0.15em] border border-foreground px-4 py-2 text-foreground hover:bg-foreground hover:text-white transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={() => { setEditing(false); setError(null) }}
          disabled={saving}
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
