'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import type { BrandHeroConfig } from '@/lib/data/site-config-defaults'
import { Spinner } from '@/components/ui/Spinner'

type Brand = 'JORDAN' | 'NIKE' | 'ADIDAS'

const BRAND_KEYS: Record<Brand, 'jordanHero' | 'nikeHero' | 'adidasHero'> = {
  JORDAN: 'jordanHero',
  NIKE: 'nikeHero',
  ADIDAS: 'adidasHero',
}

const BRAND_LABELS: Record<Brand, string> = {
  JORDAN: 'Jordan',
  NIKE: 'Nike',
  ADIDAS: 'Adidas',
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export default function BrandHeroEditor({
  initialJordan,
  initialNike,
  initialAdidas,
}: {
  initialJordan: BrandHeroConfig
  initialNike: BrandHeroConfig
  initialAdidas: BrandHeroConfig
}) {
  const [activeBrand, setActiveBrand] = useState<Brand>('JORDAN')
  const [configs, setConfigs] = useState<Record<Brand, BrandHeroConfig>>({
    JORDAN: initialJordan,
    NIKE: initialNike,
    ADIDAS: initialAdidas,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  // One file input ref per slide slot: key = `${brand}-${index}`
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const current = configs[activeBrand]

  function slotKey(index: number) {
    return `${activeBrand}-${index}`
  }

  function updateSlideField(index: number, field: 'image' | 'text', value: string) {
    setConfigs(prev => {
      const slides = prev[activeBrand].slides.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
      return { ...prev, [activeBrand]: { slides } }
    })
  }

  async function handleImageUpload(index: number, file: File) {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('La imagen no puede superar 5 MB')
      return
    }

    const key = slotKey(index)
    setUploading(prev => ({ ...prev, [key]: true }))

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const brand = activeBrand.toLowerCase()
      const path = `brand-hero/${brand}-${index}-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('products')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
      updateSlideField(index, 'image', publicUrl)
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }))
    }
  }

  function addSlide() {
    setConfigs(prev => ({
      ...prev,
      [activeBrand]: {
        slides: [...prev[activeBrand].slides, { image: '', text: '' }],
      },
    }))
  }

  function removeSlide(index: number) {
    setConfigs(prev => {
      const slides = prev[activeBrand].slides.filter((_, i) => i !== index)
      return { ...prev, [activeBrand]: { slides: slides.length > 0 ? slides : [{ image: '', text: '' }] } }
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: BRAND_KEYS[activeBrand], value: configs[activeBrand] }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Hero ${BRAND_LABELS[activeBrand]} guardado`)
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Brand tabs */}
      <div className="flex border-b border-border">
        {(['JORDAN', 'NIKE', 'ADIDAS'] as Brand[]).map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => setActiveBrand(brand)}
            className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors"
            style={{
              borderBottom: activeBrand === brand ? '2px solid #c9a96e' : '2px solid transparent',
              color: activeBrand === brand ? '#0a0a0a' : '#8a8a8a',
            }}
          >
            {BRAND_LABELS[brand]}
          </button>
        ))}
      </div>

      {/* Slides list */}
      <div className="flex flex-col gap-4">
        {current.slides.map((slide, i) => {
          const key = slotKey(i)
          const isUploading = !!uploading[key]

          return (
            <div key={i} className="flex flex-col gap-3 border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Slide {i + 1}
                </span>
                {current.slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlide(i)}
                    className="text-[9px] uppercase tracking-widest text-muted hover:text-destructive transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {/* Image field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Imagen
                </label>

                {/* Hidden file input */}
                <input
                  ref={el => { fileRefs.current[key] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(i, file)
                    e.target.value = ''
                  }}
                />

                <div className="flex gap-2">
                  {/* URL input */}
                  <input
                    type="text"
                    value={slide.image}
                    onChange={e => updateSlideField(i, 'image', e.target.value)}
                    placeholder="/brands/jordan/hero-1.webp"
                    className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-[11px] tracking-[0.05em] text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                  />

                  {/* Upload button */}
                  <button
                    type="button"
                    onClick={() => fileRefs.current[key]?.click()}
                    disabled={isUploading}
                    className="shrink-0 border border-border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isUploading ? <><Spinner /> Subiendo...</> : 'Subir archivo'}
                  </button>
                </div>

                <p className="text-[9px] text-muted/60 tracking-[0.05em]">
                  Pegá una URL o subí un archivo (máx. 5 MB)
                </p>
              </div>

              {/* Text overlay */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Texto superpuesto
                </label>
                <input
                  type="text"
                  value={slide.text}
                  onChange={e => updateSlideField(i, 'text', e.target.value)}
                  placeholder="Listo para volar"
                  className="w-full border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                />
              </div>

              {/* Image preview */}
              {slide.image && (
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-surface">
                  {isUploading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted animate-pulse">
                        Subiendo...
                      </span>
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {slide.text && (
                    <div className="absolute inset-0 flex items-end bg-black/45 p-4">
                      <span className="text-white uppercase tracking-[0.24em] text-sm font-medium">
                        {slide.text}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add slide */}
      <button
        type="button"
        onClick={addSlide}
        className="border border-dashed border-border py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:border-foreground hover:text-foreground"
      >
        + Agregar slide
      </button>

      {/* Save */}
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
          ) : `Guardar hero ${BRAND_LABELS[activeBrand]}`}
        </button>
      </div>
    </div>
  )
}
