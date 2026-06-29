'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ArrowIcon from '@/components/ui/ArrowIcon'
import { Spinner } from '@/components/ui/Spinner'

const INPUT_CLASS =
  'border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-foreground focus:outline-none transition-colors w-full'

const LABEL_CLASS =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground mb-2 block'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError('Error al actualizar la contraseña. El link puede haber expirado.')
      return
    }

    router.push('/account')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm px-6">
      <div className="mb-10 text-center">
        <Link href="/" className="text-2xl font-black uppercase tracking-[0.25em] text-foreground">
          eMe
        </Link>
      </div>

      <h1 className="mb-8 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
        Nueva contraseña
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="password" className={LABEL_CLASS}>
            Nueva contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={LABEL_CLASS}>
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
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
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Actualizando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ArrowIcon className="text-gold" size={18} />
              Actualizar contraseña
            </span>
          )}
        </button>
      </form>
    </div>
  )
}
