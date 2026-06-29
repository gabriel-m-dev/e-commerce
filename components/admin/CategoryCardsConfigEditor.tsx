'use client'

import { useState, useRef } from 'react'
import Image from '@/components/ui/AppImage'
import { toast } from 'sonner'
import { type CategoryCard } from '@/lib/data/site-config-defaults'
import { Spinner } from '@/components/ui/Spinner'

const CARD_NAMES = ['ZAPATILLAS', 'ROPA', 'ACCESORIOS']

export default function CategoryCardsConfigEditor({ initialCards }: { initialCards: CategoryCard[] }) {
  const [cards, setCards] = useState<CategoryCard[]>(initialCards)
  const [uploadingIdx, setUploadingIdx] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  function updateCard(idx: number, field: keyof CategoryCard, value: string) {
    setCards((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  async function handleImageUpload(idx: number, file: File) {
    setUploadingIdx((prev) => new Set([...prev, idx]))
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('products').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
      updateCard(idx, 'image', publicUrl)
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
        body: JSON.stringify({ key: 'categoryCards', value: { cards } }),
      })
      if (!res.ok) throw new Error()
      toast.success('Cards guardadas')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {cards.map((card, idx) => {
          const isActive = activeIdx === idx
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(isActive ? null : idx)}
              className={`flex items-center gap-3 border p-4 text-left transition-colors ${
                isActive ? 'border-gold' : 'border-border hover:border-foreground/40'
              }`}
            >
              {card.image ? (
                <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-surface border border-border">
                  <Image src={card.image} alt="" fill sizes="64px" className="object-cover object-center" />
                </div>
              ) : (
                <div className="h-12 w-16 shrink-0 bg-surface border border-border flex items-center justify-center">
                  <span className="text-[8px] uppercase tracking-widest text-muted">Sin img</span>
                </div>
              )}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                    isActive ? 'text-gold' : 'text-foreground'
                  }`}
                >
                  {card.title || CARD_NAMES[idx]}
                </span>
                {card.label && (
                  <span className="text-[9px] text-muted uppercase tracking-widest truncate">{card.label}</span>
                )}
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

      {activeIdx !== null && (
        <div className="border border-border p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold">
              {cards[activeIdx].title || CARD_NAMES[activeIdx]}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
              Imagen de fondo
            </label>
            <div className="flex items-start gap-3">
              {cards[activeIdx].image && (
                <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-surface border border-border">
                  <Image src={cards[activeIdx].image} alt="" fill sizes="112px" className="object-cover object-center" />
                </div>
              )}
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <input
                  ref={(el) => { fileRefs.current[activeIdx] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(activeIdx, file)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRefs.current[activeIdx]?.click()}
                  disabled={uploadingIdx.has(activeIdx)}
                  className="self-start border border-border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                >
                  {uploadingIdx.has(activeIdx) ? <><Spinner /> Subiendo...</> : 'Subir imagen'}
                </button>
                <input
                  type="text"
                  placeholder="O pegá una URL"
                  value={cards[activeIdx].image}
                  onChange={(e) => updateCard(activeIdx, 'image', e.target.value)}
                  className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
              Etiqueta <span className="text-muted normal-case tracking-normal font-normal">(ej: "Nueva colección")</span>
            </label>
            <input
              type="text"
              value={cards[activeIdx].label}
              onChange={(e) => updateCard(activeIdx, 'label', e.target.value)}
              className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
              Título <span className="text-muted normal-case tracking-normal font-normal">(ej: "Zapatillas")</span>
            </label>
            <input
              type="text"
              value={cards[activeIdx].title}
              onChange={(e) => updateCard(activeIdx, 'title', e.target.value)}
              className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
              Subtítulo <span className="text-muted normal-case tracking-normal font-normal">(ej: "5 modelos")</span>
            </label>
            <input
              type="text"
              value={cards[activeIdx].subtitle}
              onChange={(e) => updateCard(activeIdx, 'subtitle', e.target.value)}
              className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
              Link <span className="text-muted normal-case tracking-normal font-normal">(ej: "/products?category=Zapatillas")</span>
            </label>
            <input
              type="text"
              value={cards[activeIdx].link}
              onChange={(e) => updateCard(activeIdx, 'link', e.target.value)}
              className="border border-border bg-background px-3 py-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
            />
          </div>
        </div>
      )}

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
