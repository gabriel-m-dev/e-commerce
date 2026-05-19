'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { type BrandCategorySplitConfig } from '@/lib/data/site-config-defaults'
import { type SiteConfigKey } from '@/lib/queries/site-config'

interface BrandCategorySplitConfigEditorProps {
  brand: 'JORDAN' | 'NIKE' | 'ADIDAS'
  initialConfig: BrandCategorySplitConfig
}

const SLOTS = [
  { key: 'ropa' as const, label: 'Imagen ROPA', hint: 'Se muestra en el panel izquierdo. El CTA lleva a Remeras.' },
  { key: 'zapatillas' as const, label: 'Imagen ZAPATILLAS', hint: 'Se muestra en el panel derecho. El CTA lleva a Zapatillas.' },
]

export default function BrandCategorySplitConfigEditor({ brand, initialConfig }: BrandCategorySplitConfigEditorProps) {
  const [config, setConfig] = useState<BrandCategorySplitConfig>(initialConfig)
  const [uploading, setUploading] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const configKey: SiteConfigKey = `${brand.toLowerCase()}CategorySplit` as SiteConfigKey

  function updateImage(slot: 'ropa' | 'zapatillas', image: string) {
    setConfig(prev => ({ ...prev, [slot]: { image } }))
  }

  async function handleImageUpload(slot: 'ropa' | 'zapatillas', file: File) {
    setUploading(prev => new Set([...prev, slot]))
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `brands/${brand.toLowerCase()}/category-split-${slot}-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('products').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
      updateImage(slot, publicUrl)
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
        body: JSON.stringify({ key: configKey, value: config }),
      })
      if (!res.ok) throw new Error()
      toast.success('Imágenes guardadas')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {SLOTS.map(({ key, label, hint }) => {
        const img = config[key].image
        const isUploading = uploading.has(key)

        return (
          <div key={key} className="border border-border p-5 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">{label}</p>
              <p className="mt-1 text-[10px] text-muted">{hint}</p>
            </div>

            <div className="flex items-start gap-4">
              {img ? (
                <div className="relative h-24 w-36 shrink-0 overflow-hidden bg-surface border border-border">
                  <Image src={img} alt="" fill sizes="144px" className="object-cover object-center" />
                </div>
              ) : (
                <div className="h-24 w-36 shrink-0 bg-surface border border-dashed border-border flex items-center justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-muted">Sin imagen</span>
                </div>
              )}

              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <input
                  ref={el => { fileRefs.current[key] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(key, file)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRefs.current[key]?.click()}
                  disabled={isUploading}
                  className="self-start border border-border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isUploading ? 'Subiendo...' : 'Subir imagen'}
                </button>
                <input
                  type="text"
                  placeholder="O pegá una URL"
                  value={img}
                  onChange={e => updateImage(key, e.target.value)}
                  className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )
      })}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar imágenes'}
        </button>
      </div>
    </div>
  )
}
