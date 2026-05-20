'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { type BenefitCardsConfig } from '@/lib/data/site-config-defaults'

const CARD_META = {
  payment:  { label: 'Pagá como quieras',    description: 'Tarjetas, transferencia o efectivo. Con Mercado Pago.' },
  shipping: { label: 'Envíos a todo el país', description: 'Recibí tu pedido en la puerta de tu casa.' },
  security: { label: 'Compra segura',         description: 'Tus datos están protegidos en todo momento.' },
} as const

type SlotKey = keyof typeof CARD_META

const SLOTS: SlotKey[] = ['payment', 'shipping', 'security']

export default function BenefitCardsConfigEditor({ initialConfig }: { initialConfig: BenefitCardsConfig }) {
  const [config, setConfig] = useState<BenefitCardsConfig>(initialConfig)
  const [uploading, setUploading] = useState<Set<SlotKey>>(new Set())
  const [saving, setSaving] = useState<SlotKey | null>(null)
  const [removing, setRemoving] = useState<SlotKey | null>(null)
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

  async function handleSaveCard(slot: SlotKey) {
    setSaving(slot)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'benefitCards', value: config }),
      })
      if (!res.ok) throw new Error()
      toast.success('Card guardada')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(null)
    }
  }

  async function handleRemoveImage(slot: SlotKey) {
    setImageUrl(slot, null)
    setRemoving(slot)
    try {
      const newConfig = { ...config, [slot]: { imageUrl: null } }
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'benefitCards', value: newConfig }),
      })
      if (!res.ok) throw new Error()
      setConfig(newConfig)
      toast.success('Imagen eliminada')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {SLOTS.map((slot) => {
        const meta = CARD_META[slot]
        const imageUrl = config[slot]?.imageUrl
        const isUploading = uploading.has(slot)
        const isSaving = saving === slot
        const isRemoving = removing === slot
        const hasImage = !!imageUrl

        return (
          <div key={slot} className="border border-border">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">{meta.label}</p>
                <p className="text-[10px] text-muted mt-0.5">{meta.description}</p>
              </div>
              {/* Mode indicator */}
              <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] px-2 py-1 border ${hasImage ? 'border-gold text-gold' : 'border-border text-muted'}`}>
                {hasImage ? 'Imagen custom' : 'Predeterminado'}
              </span>
            </div>

            <div className="px-5 py-5 flex flex-col gap-4">
              {/* Image upload area */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  Imagen custom <span className="text-muted normal-case tracking-normal font-normal">(opcional — ocupa toda la card)</span>
                </p>

                {hasImage ? (
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="relative h-24 w-36 shrink-0 overflow-hidden bg-surface border border-border">
                      <Image src={imageUrl} alt={meta.label} fill sizes="144px" className="object-cover object-center" />
                    </div>

                    <div className="flex flex-col gap-2">
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
                        {isUploading ? 'Subiendo...' : 'Reemplazar imagen'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(slot)}
                        disabled={isRemoving}
                        className="self-start border border-destructive px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {isRemoving ? 'Eliminando...' : 'Quitar imagen'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    {/* Empty placeholder */}
                    <div className="h-24 w-36 shrink-0 bg-surface border border-dashed border-border flex items-center justify-center">
                      <span className="text-[9px] uppercase tracking-widest text-muted">Default</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-muted leading-relaxed">
                        Mostrando el diseño predeterminado (ícono + texto). Subí una imagen para reemplazarlo.
                      </p>
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
                        {isUploading ? 'Subiendo...' : 'Subir imagen custom'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Save button — only shown when there is an image (no-image is auto-saved on remove) */}
              {hasImage && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveCard(slot)}
                    disabled={isSaving || isUploading || isRemoving}
                    className="bg-foreground px-6 py-2.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar card'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
