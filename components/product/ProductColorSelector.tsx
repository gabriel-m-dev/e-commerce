'use client'

import { useState, type MouseEvent } from 'react'

interface ProductColorSelectorProps {
  colors: string[]
  selected?: string
  onChange: (color: string) => void
  dark?: boolean
}

export default function ProductColorSelector({
  colors,
  selected,
  onChange,
  dark = false,
}: ProductColorSelectorProps) {
  const [open, setOpen] = useState(false)

  if (!colors || colors.length === 0) return null

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold hover:opacity-80 transition-opacity cursor-pointer"
      >
        + {colors.length > 1 ? `${colors.length} colores` : 'color'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {colors.map((c) => {
        const isSelected = selected === c
        const baseBorder = dark
          ? isSelected
            ? 'border-gold ring-1 ring-gold/40'
            : 'border-white/30 hover:border-white/60'
          : isSelected
            ? 'border-gold ring-1 ring-gold/40'
            : 'border-foreground/20 hover:border-foreground/60'
        return (
          <button
            key={c}
            type="button"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              onChange(c)
            }}
            aria-label={`Seleccionar color ${c}`}
            className={`h-4 w-4 rounded-full border transition-colors cursor-pointer ${baseBorder}`}
            style={{ backgroundColor: c }}
          />
        )
      })}
    </div>
  )
}
