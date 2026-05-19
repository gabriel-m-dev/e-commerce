'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { type BrandCategorySplitConfig, type BrandHeroPanel } from '@/lib/data/site-config-defaults'
import { type SiteConfigKey } from '@/lib/queries/site-config'

interface BrandCategorySplitConfigEditorProps {
  brand: 'JORDAN' | 'NIKE' | 'ADIDAS'
  initialConfig: BrandCategorySplitConfig
}

const SLOTS: { key: 'ropa' | 'zapatillas'; label: string }[] = [
  { key: 'ropa', label: 'Panel izquierdo' },
  { key: 'zapatillas', label: 'Panel derecho' },
]

const BORDER_OPTIONS: { value: BrandHeroPanel['textBorder']; label: string }[] = [
  { value: 'none',   label: 'Sin borde' },
  { value: 'bottom', label: 'Línea debajo' },
  { value: 'full',   label: 'Cuadrado' },
]

const POSITION_OPTIONS: { value: BrandHeroPanel['textPosition']; label: string }[] = [
  { value: 'center',        label: 'Centro' },
  { value: 'bottom-center', label: 'Abajo centro' },
  { value: 'bottom-left',   label: 'Abajo izquierda' },
]

export default function BrandCategorySplitConfigEditor({ brand, initialConfig }: BrandCategorySplitConfigEditorProps) {
  const [config, setConfig] = useState<BrandCategorySplitConfig>(initialConfig)
  const [uploading, setUploading] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const configKey: SiteConfigKey = `${brand.toLowerCase()}CategorySplit` as SiteConfigKey

  function updatePanel(slot: 'ropa' | 'zapatillas', field: keyof BrandHeroPanel, value: unknown) {
    setConfig(prev => ({ ...prev, [slot]: { ...prev[slot], [field]: value } }))
  }

  async function handleImageUpload(slot: 'ropa' | 'zapatillas', file: File) {
    setUploading(prev => new Set([...prev, slot]))
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `brands/${brand.toLowerCase()}/hero-${slot}-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('products').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
      updatePanel(slot, 'image', publicUrl)
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
      toast.success('Guardado')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {SLOTS.map(({ key, label }) => {
        const panel = config[key]
        const isUploading = uploading.has(key)
        const hasText = !!panel.text?.trim()

        return (
          <div key={key} className="border border-border p-5 flex flex-col gap-5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">{label}</p>

            {/* Imagen */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Imagen</p>
              <div className="flex items-start gap-4">
                {panel.image ? (
                  <div className="relative h-24 w-36 shrink-0 overflow-hidden bg-surface border border-border">
                    <Image src={panel.image} alt="" fill sizes="144px" className="object-cover object-center" />
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
                    value={panel.image}
                    onChange={e => updatePanel(key, 'image', e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Overlay */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Overlay oscuro</p>
                <p className="text-[9px] text-muted/60 mt-0.5">Capa semitransparente sobre la imagen</p>
              </div>
              <button
                type="button"
                onClick={() => updatePanel(key, 'overlay', !panel.overlay)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${panel.overlay ? 'bg-foreground' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${panel.overlay ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Texto */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Texto (opcional)</p>
              <input
                type="text"
                placeholder="Ej: NUEVA COLECCIÓN"
                value={panel.text ?? ''}
                onChange={e => updatePanel(key, 'text', e.target.value)}
                className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
              />

              {/* Bordado */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted/70">Bordado del texto</p>
                <div className="flex gap-2 flex-wrap">
                  {BORDER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!hasText}
                      onClick={() => updatePanel(key, 'textBorder', opt.value)}
                      className={`px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] border transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                        panel.textBorder === opt.value || (!panel.textBorder && opt.value === 'none')
                          ? 'border-foreground text-foreground bg-foreground/5'
                          : 'border-border text-muted hover:border-foreground hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posición */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted/70">Posición del texto</p>
                <div className="flex gap-2 flex-wrap">
                  {POSITION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!hasText}
                      onClick={() => updatePanel(key, 'textPosition', opt.value)}
                      className={`px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] border transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                        panel.textPosition === opt.value || (!panel.textPosition && opt.value === 'center')
                          ? 'border-foreground text-foreground bg-foreground/5'
                          : 'border-border text-muted hover:border-foreground hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
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
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
