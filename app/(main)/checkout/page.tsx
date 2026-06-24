'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ArrowIcon from '@/components/ui/ArrowIcon'
import ShippingNotice from '@/components/ui/ShippingNotice'
import useCartStore from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/store/cart'

type ShippingMethod = {
  id: string
  name: string
  description: string | null
  computedCost: number
  active: boolean
  createdAt: string
}

{/* ─── Types ─── */}

type SupplierGroup = {
  supplier: string | null
  items: CartItem[]
  selectedMethodId: string | null
  computedCost: number
}

type FormFields = {
  email: string
  phone: string
  fullName: string
  address: string
  city: string
  province: string
  postalCode: string
}

type FormErrors = Partial<Record<keyof FormFields, string>>

const PROVINCES = [
  'Buenos Aires',
  'Buenos Aires (CABA)',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

const INPUT_CLASS =
  'border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-foreground focus:outline-none transition-colors w-full'

const INPUT_ERROR_CLASS =
  'border border-destructive bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-destructive focus:outline-none transition-colors w-full'

const LABEL_CLASS =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground mb-2 block'

{/* ─── Helpers ─── */}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {}

  if (!fields.email.trim()) errors.email = 'El email es requerido'
  else if (!isValidEmail(fields.email)) errors.email = 'Email inválido'

  if (!fields.phone.trim()) errors.phone = 'El teléfono es requerido'
  if (!fields.fullName.trim()) errors.fullName = 'El nombre es requerido'
  if (!fields.address.trim()) errors.address = 'La dirección es requerida'
  if (!fields.city.trim()) errors.city = 'La ciudad es requerida'
  if (!fields.province) errors.province = 'Seleccioná una provincia'
  if (!fields.postalCode.trim()) errors.postalCode = 'El código postal es requerido'

  return errors
}

{/* ─── Sub-components ─── */}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-6">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {number}
      </span>
      <h2 className="text-base font-black uppercase tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-[10px] text-destructive uppercase tracking-[0.1em]">
      {message}
    </p>
  )
}

function ShippingSelector({
  groupId,
  methods,
  loading,
  selectedMethodId,
  onSelect,
}: {
  groupId: string
  methods: ShippingMethod[]
  loading: boolean
  selectedMethodId: string | null
  onSelect: (id: string, cost: number) => void
}) {
  if (loading) {
    return (
      <div className="border border-border p-6 bg-surface">
        <p className="text-[11px] text-muted uppercase tracking-[0.15em]">
          Cargando métodos de envío...
        </p>
      </div>
    )
  }
  if (methods.length === 0) {
    return (
      <div className="border border-border p-6 bg-surface">
        <p className="text-[11px] text-muted uppercase tracking-[0.15em]">
          No hay métodos de envío disponibles.
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {methods.map((method) => (
        <label
          key={method.id}
          className={[
            'flex items-start justify-between border px-5 py-4 cursor-pointer transition-colors',
            selectedMethodId === method.id
              ? 'border-foreground bg-surface'
              : 'border-border hover:border-foreground/40',
          ].join(' ')}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name={`shippingMethod-${groupId}`}
              value={method.id}
              checked={selectedMethodId === method.id}
              onChange={() => onSelect(method.id, method.computedCost)}
              className="accent-foreground w-4 h-4 shrink-0"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground flex items-center gap-2">
                {method.name}
                {method.name.toUpperCase().includes('EMS') && (
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#c9a96e] border border-[#c9a96e] px-1.5 py-0.5 leading-none">
                    RECOMENDADO
                  </span>
                )}
              </span>
              {method.description && (
                <span className="text-[11px] text-muted leading-tight">{method.description}</span>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(method.computedCost ?? 0)}
          </span>
        </label>
      ))}
    </div>
  )
}

{/* ─── Page ─── */}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const router = useRouter()

  const subtotal = getTotal()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (mounted && items.length === 0) router.replace('/cart')
  }, [mounted, items, router])

  // ── Derive supplier groups from cart items ──
  const supplierGroups = useMemo<SupplierGroup[]>(() => {
    const map = new Map<string | null, CartItem[]>()
    for (const item of items) {
      const key = item.product.supplier ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries()).map(([supplier, groupItems]) => ({
      supplier,
      items: groupItems,
      selectedMethodId: null,
      computedCost: 0,
    }))
  }, [items])

  // ── Per-group shipping methods state: Record<groupKey, ShippingMethod[]> ──
  // groupKey = supplier value or '__null__' for null supplier
  const [groupMethods, setGroupMethods] = useState<Record<string, ShippingMethod[]>>({})
  const [methodsLoading, setMethodsLoading] = useState(true)

  // ── Per-group selections: Record<groupKey, { selectedMethodId, computedCost }> ──
  const [groupSelections, setGroupSelections] = useState<
    Record<string, { selectedMethodId: string | null; computedCost: number }>
  >({})

  const groupKey = (supplier: string | null) => supplier ?? '__null__'

  useEffect(() => {
    if (items.length === 0) return
    setMethodsLoading(true)

    // Re-derive groups locally to avoid stale closure over supplierGroups
    const localGroups = new Map<string | null, CartItem[]>()
    for (const item of items) {
      const key = item.product.supplier ?? null
      if (!localGroups.has(key)) localGroups.set(key, [])
      localGroups.get(key)!.push(item)
    }

    Promise.all(
      Array.from(localGroups.entries()).map(async ([supplier, groupItems]) => {
        const productIds = groupItems.map((i) => i.product.id).filter(Boolean)
        const quantities = groupItems.map((i) => i.quantity).join(',')
        const url = productIds.length
          ? `/api/shipping-methods?productIds=${productIds.join(',')}&quantities=${quantities}`
          : '/api/shipping-methods'
        try {
          const r = await fetch(url)
          const data = await r.json()
          return { supplier, methods: Array.isArray(data) ? data : [] }
        } catch {
          return { supplier, methods: [] }
        }
      })
    ).then((results) => {
      const nextGroupMethods: Record<string, ShippingMethod[]> = {}
      for (const { supplier, methods } of results) {
        nextGroupMethods[groupKey(supplier)] = methods
      }
      setGroupMethods(nextGroupMethods)
      setMethodsLoading(false)
    })
  }, [items])

  // ── Multi-supplier disclaimer ──
  const hasMultipleSuppliers = supplierGroups.length >= 2

  // ── Total shipping (display only) ──
  const totalShipping = Object.values(groupSelections).reduce(
    (sum, g) => sum + g.computedCost,
    0
  )
  const allGroupsSelected = supplierGroups.length > 0 &&
    supplierGroups.every((g) => (groupSelections[groupKey(g.supplier)]?.selectedMethodId ?? null) !== null)

  function handleGroupSelect(supplier: string | null, methodId: string, cost: number) {
    setGroupSelections((prev) => ({
      ...prev,
      [groupKey(supplier)]: { selectedMethodId: methodId, computedCost: cost },
    }))
  }

  const [fields, setFields] = useState<FormFields>({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  })

  // ── Payment method ──
  const [paymentMethod, setPaymentMethod] = useState<'mp' | 'transfer'>('mp')

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!allGroupsSelected) {
      setSubmitError('Seleccioná un método de envío para cada grupo de productos.')
      return
    }

    setLoading(true)
    setSubmitError(null)

    // Build shippingGroups payload for the API
    const shippingGroups = supplierGroups.map((g) => ({
      supplier: g.supplier,
      shippingMethodId: groupSelections[groupKey(g.supplier)]!.selectedMethodId!,
    }))

    const payload = {
      items,
      buyer: {
        email: fields.email,
        fullName: fields.fullName,
        phone: fields.phone,
      },
      shipping: {
        address: fields.address,
        city: fields.city,
        province: fields.province,
        postalCode: fields.postalCode,
      },
      shippingGroups,
    }

    try {
      if (paymentMethod === 'transfer') {
        const res = await fetch('/api/checkout/create-transfer-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          setSubmitError(data.error ?? 'Error al crear la orden de transferencia')
          setLoading(false)
          return
        }

        const { orderId } = await res.json()
        router.push(`/checkout/transferencia/${orderId}`)
        return
      }

      // ── Mercado Pago flow (default) ──
      const res = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.error ?? 'Error al procesar el pago')
        setLoading(false)
        return
      }

      const { initPoint, orderId } = await res.json()
      if (orderId) sessionStorage.setItem('luxe-last-order-id', orderId)
      window.location.href = initPoint
    } catch {
      setSubmitError('Error de conexión. Verificá tu internet e intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">

        {/* ─── Page header ─── */}
        <div className="border-b border-border py-8">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground"
          >
            LUXE.
          </Link>
        </div>

        <div className="py-12 lg:py-16 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* ─── Order summary — mobile first ─── */}
          <aside className="w-full lg:hidden border border-border p-6">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shipping={allGroupsSelected ? totalShipping : null}
              paymentMethod={paymentMethod}
            />
          </aside>

          {/* ─── Form ─── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex-1 min-w-0"
          >

            {/* ─── 01 Contacto ─── */}
            <section className="mb-12">
              <SectionHeader number="01" title="Contacto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className={LABEL_CLASS}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={fields.email}
                    onChange={handleChange}
                    className={errors.email ? INPUT_ERROR_CLASS : INPUT_CLASS}
                  />
                  <FieldError message={errors.email} />
                </div>
                <div>
                  <label htmlFor="phone" className={LABEL_CLASS}>
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+54 11 0000-0000"
                    value={fields.phone}
                    onChange={handleChange}
                    className={errors.phone ? INPUT_ERROR_CLASS : INPUT_CLASS}
                  />
                  <FieldError message={errors.phone} />
                </div>
              </div>
            </section>

            {/* ─── 02 Envío ─── */}
            <section className="mb-12">
              <SectionHeader number="02" title="Envío" />
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="fullName" className={LABEL_CLASS}>
                    Nombre completo
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Nombre y apellido"
                    value={fields.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? INPUT_ERROR_CLASS : INPUT_CLASS}
                  />
                  <FieldError message={errors.fullName} />
                </div>
                <div>
                  <label htmlFor="address" className={LABEL_CLASS}>
                    Dirección
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Calle y número"
                    value={fields.address}
                    onChange={handleChange}
                    className={errors.address ? INPUT_ERROR_CLASS : INPUT_CLASS}
                  />
                  <FieldError message={errors.address} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className={LABEL_CLASS}>
                      Ciudad
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Ciudad"
                      value={fields.city}
                      onChange={handleChange}
                      className={errors.city ? INPUT_ERROR_CLASS : INPUT_CLASS}
                    />
                    <FieldError message={errors.city} />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className={LABEL_CLASS}>
                      Código postal
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      autoComplete="postal-code"
                      placeholder="1234"
                      value={fields.postalCode}
                      onChange={handleChange}
                      className={errors.postalCode ? INPUT_ERROR_CLASS : INPUT_CLASS}
                    />
                    <FieldError message={errors.postalCode} />
                  </div>
                </div>
                <div>
                  <label htmlFor="province" className={LABEL_CLASS}>
                    Provincia
                  </label>
                  <select
                    id="province"
                    name="province"
                    autoComplete="address-level1"
                    value={fields.province}
                    onChange={handleChange}
                    className={errors.province ? INPUT_ERROR_CLASS : INPUT_CLASS}
                  >
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.province} />
                </div>
              </div>
            </section>

            {/* ─── 03 Método de envío ─── */}
            <section className="mb-12">
              <SectionHeader number="03" title="Método de envío" />

              {/* Multi-supplier disclaimer */}
              {hasMultipleSuppliers && (
                <div className="mb-6 border border-border px-5 py-4 bg-surface">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground mb-3">
                    Tus productos son de distintos proveedores. El envío se abona por separado para cada uno.
                  </p>
                  <div className="flex flex-col gap-2">
                    {supplierGroups.filter((g) => g.supplier !== null).map((group) => (
                      <div key={group.supplier} className="flex items-baseline gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold shrink-0">
                          {group.supplier}:
                        </span>
                        <span className="text-[10px] text-muted leading-tight">
                          {group.items.map((i) => i.product.name).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Per-group shipping selectors */}
              <div className="flex flex-col gap-8">
                {supplierGroups.map((group) => {
                  const key = groupKey(group.supplier)
                  const methods = groupMethods[key] ?? []
                  const selection = groupSelections[key] ?? { selectedMethodId: null, computedCost: 0 }
                  return (
                    <div key={key}>
                      {group.supplier && (
                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                          Proveedor: {group.supplier}
                        </p>
                      )}
                      <ShippingSelector
                        groupId={key}
                        methods={methods}
                        loading={methodsLoading}
                        selectedMethodId={selection.selectedMethodId}
                        onSelect={(id, cost) => handleGroupSelect(group.supplier, id, cost)}
                      />
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ─── 04 Pago ─── */}
            <section className="mb-12">
              <SectionHeader number="04" title="Pago" />
              <div className="flex flex-col gap-3">

                {/* ── Mercado Pago option ── */}
                <label
                  className={[
                    'flex items-start gap-4 border px-5 py-4 cursor-pointer transition-colors',
                    paymentMethod === 'mp'
                      ? 'border-foreground bg-surface'
                      : 'border-border hover:border-foreground/40',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mp"
                    checked={paymentMethod === 'mp'}
                    onChange={() => setPaymentMethod('mp')}
                    className="accent-foreground w-4 h-4 shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="shrink-0 w-8 h-8 bg-[#009ee3] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                        Mercado Pago
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted">
                      Serás redirigido a Mercado Pago para completar el pago de forma segura. Tarjeta, transferencia, efectivo y cuotas.
                    </p>
                  </div>
                </label>

                {/* ── Transferencia option ── */}
                <label
                  className={[
                    'flex items-start gap-4 border px-5 py-4 cursor-pointer transition-colors',
                    paymentMethod === 'transfer'
                      ? 'border-gold bg-surface'
                      : 'border-border hover:border-foreground/40',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                    className="accent-foreground w-4 h-4 shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                        Transferencia Bancaria
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gold border border-gold px-2 py-0.5">
                        6% OFF
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted">
                      Recibirás CBU/alias y el monto exacto. Enviá el comprobante y confirmamos tu pedido.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* ─── CTA ─── */}
            <div>
              <div className="mb-6">
                <ShippingNotice variant="checkout" />
              </div>
              {submitError && (
                <p className="mb-4 text-[11px] text-destructive uppercase tracking-[0.1em] text-center">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || methodsLoading || !allGroupsSelected}
                className="w-full flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Confirmar pedido'}
                {!loading && <ArrowIcon className="shrink-0 text-gold" />}
              </button>
              <div className="mt-4 flex items-center justify-center gap-2">
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
                  <rect x="1" y="5.5" width="10" height="8" rx="0.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
                  <path d="M3.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                  <circle cx="6" cy="9.5" r="1" fill="currentColor" fillOpacity="0.4" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Tus datos están protegidos
                </span>
              </div>
            </div>
          </form>

          {/* ─── Order summary — desktop ─── */}
          <aside className="hidden lg:block w-[380px] shrink-0 sticky top-8">
            <div className="border border-border p-8">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={allGroupsSelected ? totalShipping : null}
                paymentMethod={paymentMethod}
              />
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

{/* ─── Order Summary component ─── */}

function OrderSummary({
  items,
  subtotal,
  shipping,
  paymentMethod,
}: {
  items: CartItem[]
  subtotal: number
  shipping: number | null
  paymentMethod: 'mp' | 'transfer'
}) {
  const discount = paymentMethod === 'transfer' ? Math.floor(subtotal * 0.06) : 0
  const discountedSubtotal = subtotal - discount
  const displayTotal = discountedSubtotal + (shipping ?? 0)

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-base font-black uppercase tracking-tight text-foreground">
          Tu pedido
        </h2>
        <span className="flex-1 h-px bg-gold" />
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm leading-relaxed text-muted mb-4">
            Tu carrito está vacío.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground border border-foreground px-5 py-2.5 transition-colors hover:bg-foreground hover:text-background"
          >
            Ver productos <ArrowIcon size={14} className="shrink-0" />
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-4 mb-6">
            {items.map((item) => (
              <li
                key={`${item.product.id}-${item.size ?? 'ns'}`}
                className="flex items-start gap-3"
              >
                <div className="relative w-12 h-12 shrink-0 border border-border bg-surface overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground leading-tight truncate">
                    {item.product.name}
                  </p>
                  {item.size && (
                    <p className="text-[10px] text-muted uppercase tracking-[0.1em] mt-0.5">
                      Talle {item.size}
                    </p>
                  )}
                  <p className="text-[10px] text-muted mt-0.5">
                    x{item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="border-t border-border pt-4 flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Subtotal
              </span>
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>
            {paymentMethod === 'transfer' && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Descuento 6%
                </span>
                <span className="text-sm font-semibold text-gold">
                  -{formatPrice(discount)}
                </span>
              </div>
            )}
            {shipping !== null && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Envío
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatPrice(shipping)}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between items-baseline">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                Total
              </span>
              <span className="text-base font-semibold text-foreground">
                {formatPrice(displayTotal)}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  )
}
