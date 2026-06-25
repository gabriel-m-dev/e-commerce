'use client'

import { useState, useRef } from 'react'
import Image from '@/components/ui/AppImage'
import { toast } from 'sonner'
import { type HeroSlide } from '@/lib/data/site-config-defaults'

export default function HeroConfigEditor({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides)
  const [uploadingIdx, setUploadingIdx] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  function updateSlide(idx: number, field: keyof HeroSlide, value: string) {
    setSlides((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  async function handleImageUpload(idx: number, file: File) {
    setUploadingIdx((prev) => new Set([...prev, idx]))
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('products').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
      updateSlide(idx, 'image', publicUrl)
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingIdx((prev) => { const s = new Set(prev); s.delete(idx); return s })
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'hero', value: { slides } }),
      })
      if (!res.ok) throw new Error()
      toast.success('Hero guardado')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {slides.map((slide, idx) => (
        <div key={idx} className="border border-border">
          {/* Accordion header */}
          <button
            type="button"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Slide {idx + 1}
              </span>
              {slide.title && (
                <span className="text-[10px] text-foreground/60 truncate max-w-[200px]">{slide.title}</span>
              )}
            </div>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
              className={`shrink-0 text-muted transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}
            >
              <path d="M2 5l5 5 5-5" />
            </svg>
          </button>

          {openIdx === idx && (
            <div className="border-t border-border px-5 py-5 flex flex-col gap-5">
              {/* Image */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  Imagen
                </label>
                <div className="flex items-start gap-3">
                  {slide.image && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-surface border border-border">
                      <Image src={slide.image} alt="" fill sizes="80px" className="object-cover object-center" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <input
                      ref={(el) => { fileRefs.current[idx] = el }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(idx, file)
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[idx]?.click()}
                      disabled={uploadingIdx.has(idx)}
                      className="self-start border border-border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {uploadingIdx.has(idx) ? 'Subiendo...' : 'Subir imagen'}
                    </button>
                    <input
                      type="text"
                      placeholder="O pegá una URL"
                      value={slide.image}
                      onChange={(e) => updateSlide(idx, 'image', e.target.value)}
                      className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  Etiqueta <span className="text-muted normal-case tracking-normal font-normal">(ej: "Nueva Colección")</span>
                </label>
                <input
                  type="text"
                  value={slide.label}
                  onChange={(e) => updateSlide(idx, 'label', e.target.value)}
                  className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  Título <span className="text-muted normal-case tracking-normal font-normal">(ej: "Diseño que se siente.")</span>
                </label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                  className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  Subtítulo <span className="text-muted normal-case tracking-normal font-normal">(ej: "Calidad que se nota.")</span>
                </label>
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                  className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                    Texto del botón
                  </label>
                  <input
                    type="text"
                    value={slide.ctaText}
                    onChange={(e) => updateSlide(idx, 'ctaText', e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                    Link del botón
                  </label>
                  <input
                    type="text"
                    value={slide.ctaLink}
                    onChange={(e) => updateSlide(idx, 'ctaLink', e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar hero'}
        </button>
      </div>
    </div>
  )
}
