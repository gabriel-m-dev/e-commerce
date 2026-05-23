'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { AnnouncementBarConfig } from '@/lib/data/site-config-defaults'

export default function AnnouncementBarEditor({
  initialConfig,
}: {
  initialConfig: AnnouncementBarConfig
}) {
  const [config, setConfig] = useState<AnnouncementBarConfig>(initialConfig)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'announcementBar', value: config }),
      })
      if (!res.ok) throw new Error()
      toast.success('Barra guardada')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toggle */}
      <div className="flex items-center justify-between border border-border p-5">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
            Barra activa
          </span>
          <span className="text-[10px] text-muted uppercase tracking-widest">
            Mostrá u ocultá la barra en la tienda
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled}
          onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
          className="relative h-5 w-9 shrink-0 transition-colors"
          style={{ backgroundColor: config.enabled ? '#c9a96e' : '#e5e5e5' }}
        >
          <span
            className="absolute top-0.5 h-4 w-4 bg-white transition-transform"
            style={{ transform: config.enabled ? 'translateX(16px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      {/* Text input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="announcement-text"
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground"
        >
          Texto del anuncio
        </label>
        <span className="text-[9px] text-muted uppercase tracking-widest -mt-1">
          El texto se repite en bucle. Usá ·  para separar frases.
        </span>
        <textarea
          id="announcement-text"
          rows={3}
          value={config.text}
          onChange={e => setConfig(prev => ({ ...prev, text: e.target.value }))}
          className="w-full resize-none border border-border bg-background px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
          placeholder="ENVÍOS A TODO EL PAÍS · NUEVOS INGRESOS DISPONIBLES"
        />
      </div>

      {/* Preview */}
      {config.text.trim() && (
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
            Vista previa
          </span>
          <div
            className="relative flex h-10 w-full items-center overflow-hidden"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            <span
              className="truncate px-4 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#c9a96e' }}
            >
              {config.text}
            </span>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar barra'}
        </button>
      </div>
    </div>
  )
}
