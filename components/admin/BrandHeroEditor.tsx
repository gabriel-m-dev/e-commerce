'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { BrandHeroConfig } from '@/lib/data/site-config-defaults'

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

  const current = configs[activeBrand]

  function updateSlideField(index: number, field: 'image' | 'text', value: string) {
    setConfigs(prev => {
      const slides = prev[activeBrand].slides.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
      return { ...prev, [activeBrand]: { slides } }
    })
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
        {current.slides.map((slide, i) => (
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

            {/* Image URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                URL de imagen
              </label>
              <input
                type="text"
                value={slide.image}
                onChange={e => updateSlideField(i, 'image', e.target.value)}
                placeholder="/brands/jordan/hero-1.webp"
                className="w-full border border-border bg-background px-3 py-2 text-[11px] tracking-[0.05em] text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
              />
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
        ))}
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
          {saving ? 'Guardando...' : `Guardar hero ${BRAND_LABELS[activeBrand]}`}
        </button>
      </div>
    </div>
  )
}
