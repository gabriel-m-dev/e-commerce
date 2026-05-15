'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type SearchProduct = { id: string; name: string; slug: string; category: string }

export default function NavbarSearch({
  products,
  onOpenChange,
}: {
  products: SearchProduct[]
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  // Cerrar al hacer click fuera del componente
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // Cerrar con tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleOpen() {
    setOpen(true)
    onOpenChange?.(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleClose() {
    setOpen(false)
    setQuery('')
    onOpenChange?.(false)
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Input expandible — a la izquierda del ícono */}
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'w-52' : 'w-0'}`}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="BUSCAR..."
          className="w-full border-b border-foreground bg-transparent text-[11px] uppercase tracking-[0.18em] text-foreground placeholder:text-muted outline-none pb-0.5"
        />
      </div>

      {/* Botón lupa — abre o cierra el panel */}
      <button
        onClick={open ? handleClose : handleOpen}
        aria-label="Buscar"
        className="text-foreground transition-opacity hover:opacity-60 ml-0 flex items-center cursor-pointer"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {/* Dropdown de resultados */}
      {open && query.trim() && (
        <div className="absolute top-full right-0 mt-2 w-64 border border-border bg-background shadow-lg z-50">
          {results.length > 0 ? (
            results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={handleClose}
                className="flex flex-col px-4 py-3 border-b border-border last:border-0 hover:bg-surface transition-colors"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
                  {product.name}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted mt-0.5">
                  {product.category}
                </span>
              </Link>
            ))
          ) : (
            <div className="flex flex-col px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                Sin resultados
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
