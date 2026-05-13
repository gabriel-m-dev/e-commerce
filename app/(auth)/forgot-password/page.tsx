'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/constants'
import ArrowIcon from '@/components/ui/ArrowIcon'

const INPUT_CLASS =
  'border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-foreground focus:outline-none transition-colors w-full'

const LABEL_CLASS =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground mb-2 block'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError('Error al enviar el email. Verificá que la dirección sea correcta.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm px-6 text-center">
        <Link href="/" className="text-2xl font-black uppercase tracking-[0.25em] text-foreground">
          LUXE.
        </Link>
        <div className="mt-10 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
            Revisá tu email
          </p>
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted">
            Enviamos un link para restablecer tu contraseña a{' '}
            <span className="text-foreground">{email}</span>
          </p>
        </div>
        <Link
          href="/login"
          className="mt-8 inline-flex text-[11px] font-semibold uppercase tracking-[0.15em] text-muted underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Volver al login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm px-6">
      <div className="mb-10 text-center">
        <Link href="/" className="text-2xl font-black uppercase tracking-[0.25em] text-foreground">
          LUXE.
        </Link>
      </div>

      <h1 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
        Olvidaste tu contraseña
      </h1>
      <p className="mb-8 text-[11px] uppercase tracking-[0.12em] text-muted">
        Ingresá tu email y te enviamos un link para restablecerla.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={INPUT_CLASS}
          />
        </div>

        {error && (
          <p className="text-[11px] text-destructive tracking-wide">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-between bg-foreground px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <span>{loading ? 'Enviando...' : 'Enviar link'}</span>
          <ArrowIcon className="text-gold" size={18} />
        </button>
      </form>

      <p className="mt-8 text-center text-[11px] uppercase tracking-[0.15em] text-muted">
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Volver al login
        </Link>
      </p>
    </div>
  )
}
