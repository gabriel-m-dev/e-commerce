'use client'

import { useState } from 'react'
import { type DbProduct } from '@/lib/queries/products'
import { formatSlug, formatPrice } from '@/lib/utils'
import type { ShippingMethodRow } from '@/lib/queries/shipping-methods'

interface EditProductFormProps {
  product: DbProduct
  categories: { id: string; name: string; slug: string }[]
  shippingMethods: ShippingMethodRow[]
  onSuccess: () => void
  onClose: () => void
}

export default function EditProductForm({
  product,
  categories,
  shippingMethods,
  onSuccess,
  onClose,
}: EditProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true)
  const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set())

  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    price: product.price.toString(),
    comparePrice: product.comparePrice?.toString() ?? '',
    brand: product.brand ?? 'OTROS',
    description: product.description,
    images: product.images.length > 0 ? [...product.images] : [''],
    stock: product.stock.toString(),
    featured: product.featured,
    active: product.active,
    shippingMethodId: product.shippingMethodId ?? '',
  })

  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(
    product.categorySlugs && product.categorySlugs.length > 0
      ? product.categorySlugs
      : [product.categorySlug]
  )
  const [primaryCategorySlug, setPrimaryCategorySlug] = useState<string>(
    product.categorySlug
  )

  const [colors, setColors] = useState<string[]>(
    (product.colors ?? []).map((c) => c.toUpperCase())
  )
  const [currentColor, setCurrentColor] = useState('#000000')
  const [sizes, setSizes] = useState<string[]>(product.sizes ?? [])
  const [allCategories, setAllCategories] = useState(categories)

  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
  const isSneakers = selectedCategorySlugs.includes('zapatillas')
  const AVAILABLE_SIZES = isSneakers ? SHOE_SIZES : CLOTHING_SIZES

  function toggleCategorySlug(slug: string) {
    setSelectedCategorySlugs((prev) => {
      if (prev.includes(slug)) {
        const next = prev.filter((s) => s !== slug)
        if (primaryCategorySlug === slug) {
          setPrimaryCategorySlug(next[0] ?? '')
        }
        return next
      } else {
        const next = [...prev, slug]
        if (!primaryCategorySlug) {
          setPrimaryCategorySlug(slug)
        }
        return next
      }
    })
  }

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  function addColor() {
    const normalized = currentColor.toUpperCase()
    if (colors.includes(normalized)) return
    setColors((prev) => [...prev, normalized])
  }

  function removeColor(hex: string) {
    setColors((prev) => prev.filter((c) => c !== hex))
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited ? prev.slug : formatSlug(value),
    }))
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug: value }))
  }

  function updateImage(index: number, value: string) {
    setForm((prev) => {
      const imgs = [...prev.images]
      imgs[index] = value
      return { ...prev, images: imgs }
    })
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  async function uploadFile(file: File, index: number) {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const path = `products/${form.brand}/${slug}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw new Error(error.message)
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
    setForm((prev) => {
      const imgs = [...prev.images]
      imgs[index] = publicUrl
      return { ...prev, images: imgs }
    })
  }

  async function handleFileUpload(index: number, file: File) {
    setUploadingIndices((prev) => new Set([...prev, index]))
    try {
      await uploadFile(file, index)
    } catch {
      setError('Error al subir la imagen. Verificá que el bucket "products" exista en Supabase.')
    } finally {
      setUploadingIndices((prev) => { const s = new Set(prev); s.delete(index); return s })
    }
  }

  async function handleMultiFileUpload(files: FileList) {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const baseIndex = form.images.findIndex((img) => !img.trim())
    const startIdx = baseIndex >= 0 ? baseIndex : form.images.length

    setForm((prev) => {
      const imgs = [...prev.images]
      for (let i = 0; i < fileArray.length; i++) {
        if (startIdx + i >= imgs.length) imgs.push('')
      }
      return { ...prev, images: imgs }
    })
    setUploadingIndices(new Set(fileArray.map((_, i) => startIdx + i)))

    await Promise.all(
      fileArray.map(async (file, i) => {
        const index = startIdx + i
        try {
          await uploadFile(file, index)
        } catch {
          setError(`Error al subir ${file.name}`)
        } finally {
          setUploadingIndices((prev) => { const s = new Set(prev); s.delete(index); return s })
        }
      })
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const images = form.images.filter((img) => img.trim().length > 0)
    if (images.length === 0) {
      setError('Agregá al menos una imagen')
      setLoading(false)
      return
    }

    if (selectedCategorySlugs.length === 0) {
      setError('Seleccioná al menos una categoría')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          price: Number(form.price),
          comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
          categorySlugs: selectedCategorySlugs,
          primaryCategorySlug,
          brand: form.brand,
          images,
          description: form.description.trim(),
          stock: Number(form.stock),
          featured: form.featured,
          active: form.active,
          colors,
          sizes,
          shippingMethodId: form.shippingMethodId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al guardar')
        return
      }

      onSuccess()
    } catch {
      setError('Error de red. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background border border-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-[12px] font-black uppercase tracking-[0.22em]">
              Editar producto
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="text-muted hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6">
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Nombre</label>
              <input type="text" required value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full" />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Slug</label>
              <input type="text" required value={form.slug} onChange={(e) => handleSlugChange(e.target.value)}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full" />
            </div>

            {/* Categorías */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Categorías</label>
              <div className="flex flex-col gap-2 border border-border p-3">
                {allCategories.map((cat) => {
                  const isChecked = selectedCategorySlugs.includes(cat.slug)
                  return (
                    <div key={cat.id} className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => { toggleCategorySlug(cat.slug); setSizes([]) }}
                          className="h-4 w-4 cursor-pointer accent-foreground"
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
                          {cat.name}
                        </span>
                      </label>
                      {isChecked && (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="editPrimaryCategory"
                            checked={primaryCategorySlug === cat.slug}
                            onChange={() => setPrimaryCategorySlug(cat.slug)}
                            className="h-3.5 w-3.5 cursor-pointer accent-foreground"
                          />
                          <span className="text-[9px] uppercase tracking-[0.15em] text-muted">
                            Principal
                          </span>
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
              {selectedCategorySlugs.length === 0 && (
                <span className="text-[9px] text-destructive uppercase tracking-[0.12em]">
                  Seleccioná al menos una categoría
                </span>
              )}
            </div>

            {/* Marca */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Marca</label>
              <select
                value={form.brand}
                onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full cursor-pointer"
              >
                <option value="OTROS">Otros / LUXE.</option>
                <option value="NIKE">Nike</option>
                <option value="JORDAN">Jordan</option>
                <option value="ADIDAS">Adidas</option>
              </select>
            </div>

            {/* Método de envío */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Método de envío</label>
              <select
                value={form.shippingMethodId}
                onChange={(e) => setForm((prev) => ({ ...prev, shippingMethodId: e.target.value }))}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full cursor-pointer"
              >
                <option value="">Sin método asignado</option>
                {shippingMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {formatPrice(m.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Precio (ARS)</label>
              <input type="number" required min={1} step={1} value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full" />
            </div>

            {/* Precio anterior (oferta) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Precio anterior (oferta)</label>
              <input type="number" min={1} step={1} placeholder="Dejar vacío si no es oferta" value={form.comparePrice}
                onChange={(e) => setForm((prev) => ({ ...prev, comparePrice: e.target.value }))}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full" />
              <span className="text-[9px] text-muted uppercase tracking-[0.12em]">
                Si es mayor al precio actual, aparece el badge de descuento
              </span>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Descripción</label>
              <textarea required rows={3} value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full resize-none" />
            </div>

            {/* Imágenes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Imágenes</label>
              <div className="flex flex-col gap-2">
                {form.images.map((img, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input type="url" value={img} placeholder="https://..." onChange={(e) => updateImage(i, e.target.value)}
                        disabled={uploadingIndices.has(i)}
                        className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors flex-1 disabled:opacity-40" />
                      <label className={['flex h-[38px] cursor-pointer items-center border border-border px-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-foreground hover:text-foreground shrink-0', uploadingIndices.has(i) ? 'opacity-40 pointer-events-none' : ''].join(' ')}>
                        {uploadingIndices.has(i) ? '...' : 'Subir'}
                        <input type="file" accept="image/*" className="sr-only"
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(i, file); e.target.value = '' }} />
                      </label>
                      {form.images.length > 1 && (
                        <button type="button" onClick={() => removeImage(i)} disabled={uploadingIndices.has(i)}
                          className="flex h-[38px] w-[38px] items-center justify-center border border-border text-muted transition-colors hover:border-destructive hover:text-destructive disabled:opacity-40 shrink-0"
                          aria-label="Eliminar imagen">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M1 1l8 8M9 1L1 9" /></svg>
                        </button>
                      )}
                    </div>
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-16 w-16 object-cover border border-border"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>
                ))}
                  <label className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors underline underline-offset-2">
                    + Agregar imágenes
                    <input type="file" accept="image/*" multiple className="sr-only"
                      onChange={(e) => { if (e.target.files?.length) handleMultiFileUpload(e.target.files); e.target.value = '' }} />
                  </label>
              </div>
            </div>

            {/* Colores */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                Colores
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-8 h-8 rounded-none border border-border cursor-pointer p-0"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="flex h-[38px] items-center border border-border px-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-foreground hover:text-foreground shrink-0"
                >
                  Agregar
                </button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {colors.map((color) => (
                    <span
                      key={color}
                      className="flex items-center gap-1.5 px-2 py-1 border border-border text-[10px] uppercase tracking-[0.1em]"
                    >
                      <span
                        className="w-3 h-3 inline-block shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-muted hover:text-foreground ml-1"
                        aria-label={`Eliminar ${color}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tallas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Tallas</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => (
                  <label key={size} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="h-4 w-4 cursor-pointer accent-foreground"
                    />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
                      {size}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Stock</label>
              <input type="number" required min={0} step={1} value={form.stock}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                className="border border-border bg-transparent px-3 py-2 text-[12px] text-foreground outline-none focus:border-foreground transition-colors w-full" />
            </div>

            {/* Destacado */}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="edit-featured" checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 cursor-pointer accent-foreground" />
              <label htmlFor="edit-featured" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted cursor-pointer">
                Producto destacado
              </label>
            </div>

            {/* Activo */}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="edit-active" checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4 cursor-pointer accent-foreground" />
              <label htmlFor="edit-active" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted cursor-pointer">
                Producto activo
              </label>
            </div>

            {/* Error */}
            {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 border-t border-border pt-5">
              <button type="submit" disabled={loading}
                className="flex h-10 flex-1 items-center justify-center bg-foreground text-[10px] font-semibold uppercase tracking-[0.18em] text-background hover:opacity-80 transition-opacity disabled:opacity-40">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={onClose} disabled={loading}
                className="flex h-10 items-center justify-center border border-border px-6 text-[10px] font-semibold uppercase tracking-[0.18em] hover:border-foreground transition-colors disabled:opacity-40">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
