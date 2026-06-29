'use client'

import { useState, useRef } from 'react'
import Image from '@/components/ui/AppImage'
import { toast } from 'sonner'
import { type BenefitCardsConfig } from '@/lib/data/site-config-defaults'
import { Spinner } from '@/components/ui/Spinner'

const CARD_META = {
  payment:  { label: 'Pagá como quieras',     description: 'Tarjetas, transferencia o efectivo. Con Mercado Pago.' },
  shipping: { label: 'Envíos a todo el país',  description: 'Recibí tu pedido en la puerta de tu casa.' },
  security: { label: 'Compra segura',          description: 'Tus datos están protegidos en todo momento.' },
} as const

type SlotKey = keyof typeof CARD_META

const SLOTS: SlotKey[] = ['payment', 'shipping', 'security']

export default function BenefitCardsConfigEditor({ initialConfig }: { initialConfig: BenefitCardsConfig }) {
  const [config, setConfig] = useState<BenefitCardsConfig>(initialConfig)
  const [uploading, setUploading] = useState<Set<SlotKey>>(new Set())
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<SlotKey | null>(null)
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null)
  const fileRefs = useRef<Partial<Record<SlotKey, HTMLInputElement | null>>>({})

  function setImageUrl(slot: SlotKey, url: string | null) {
    setConfig(prev => ({ ...prev, [slot]: { imageUrl: url } }))
  }

  async function handleImageUpload(slot: SlotKey, file: File) {
    setUploading(prev => new Set([...prev, slot]))
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `benefit-cards/${slot}-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('products').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
      setImageUrl(slot, publicUrl)
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(prev => { const s = new Set(prev); s.delete(slot); return s })
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'benefitCards', value: config }),
      })
      if (!res.ok) throw new Error()
      toast.success('Cards guardadas')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveImage(slot: SlotKey) {
    setRemoving(slot)
    const newConfig = { ...config, [slot]: { imageUrl: null } }
    setConfig(newConfig)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'benefitCards', value: newConfig }),
      })
      if (!res.ok) throw new Error()
      toast.success('Imagen eliminada')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {SLOTS.map((slot) => {
          const meta = CARD_META[slot]
          const imageUrl = config[slot]?.imageUrl
          const isActive = activeSlot === slot

          return (
            <button
              key={slot}
              type="button"
              onClick={() => setActiveSlot(isActive ? null : slot)}
              className={`flex items-center gap-3 border p-4 text-left transition-colors ${
                isActive ? 'border-gold' : 'border-border hover:border-foreground/40'
              }`}
            >
              {imageUrl ? (
                <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-surface border border-border">
                  <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover object-center" />
                </div>
              ) : (
                <div className="h-12 w-16 shrink-0 bg-surface border border-border flex items-center justify-center">
                  <span className="text-[8px] uppercase tracking-widest text-muted">Default</span>
                </div>
              )}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                    isActive ? 'text-gold' : 'text-foreground'
                  }`}
                >
                  {meta.label}
                </span>
                <span className="text-[9px] text-muted uppercase tracking-widest">
                  {imageUrl ? 'Imagen custom' : 'Predeterminado'}
                </span>
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={`shrink-0 transition-transform ${isActive ? 'rotate-90 text-gold' : 'text-muted'}`}
              >
                <path d="M4 2l4 4-4 4" />
              </svg>
            </button>
          )
        })}
      </div>

      {activeSlot !== null && (() => {
        const slot = activeSlot
        const meta = CARD_META[slot]
        const imageUrl = config[slot]?.imageUrl
        const isUploading = uploading.has(slot)
        const isRemoving = removing === slot

        return (
          <div className="border border-border p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold">
                {meta.label}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                Imagen custom <span className="text-muted normal-case tracking-normal font-normal">(opcional — ocupa toda la card)</span>
              </label>
              <div className="flex items-start gap-3">
                {imageUrl ? (
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-surface border border-border">
                    <Image src={imageUrl} alt={meta.label} fill sizes="112px" className="object-cover object-center" />
                  </div>
                ) : (
                  <div className="h-20 w-28 shrink-0 bg-surface border border-dashed border-border flex items-center justify-center">
                    <span className="text-[8px] uppercase tracking-widest text-muted">Default</span>
                  </div>
                )}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <input
                    ref={el => { fileRefs.current[slot] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(slot, file)
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[slot]?.click()}
                    disabled={isUploading}
                    className="self-start border border-border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isUploading ? <><Spinner /> Subiendo...</> : imageUrl ? 'Reemplazar imagen' : 'Subir imagen custom'}
                  </button>
                  <input
                    type="text"
                    placeholder="O pegá una URL"
                    value={imageUrl ?? ''}
                    onChange={e => setImageUrl(slot, e.target.value || null)}
                    className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
                  />
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(slot)}
                      disabled={isRemoving}
                      className="self-start border border-destructive px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {isRemoving ? 'Eliminando...' : 'Quitar imagen'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Guardando...
            </span>
          ) : 'Guardar cards'}
        </button>
      </div>
    </div>
  )
}
