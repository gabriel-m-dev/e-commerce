'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ArrowIcon from '@/components/ui/ArrowIcon'

// ─── Constants ───────────────────────────────────────────────────────────────

const INPUT_CLASS =
  'border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-foreground focus:outline-none transition-colors w-full'

const INPUT_ERROR_CLASS =
  'border border-destructive bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-destructive focus:outline-none transition-colors w-full'

const LABEL_CLASS =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground mb-2 block'

// ─── Google icon ─────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Fields = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type Errors = Partial<Record<keyof Fields, string>>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const [fields, setFields] = useState<Fields>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function update(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function validate(): Errors {
    const errs: Errors = {}
    if (!fields.name.trim()) errs.name = 'El nombre es requerido.'
    if (!fields.email.trim()) errs.email = 'El email es requerido.'
    if (!fields.password) errs.password = 'La contraseña es requerida.'
    else if (fields.password.length < 6) errs.password = 'Mínimo 6 caracteres.'
    if (!fields.confirmPassword) errs.confirmPassword = 'Confirmá tu contraseña.'
    else if (fields.password !== fields.confirmPassword)
      errs.confirmPassword = 'Las contraseñas no coinciden.'
    return errs
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/`,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setGlobalError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: { name: fields.name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/`,
      },
    })

    setLoading(false)

    if (error) {
      setGlobalError(
        error.message.includes('already registered')
          ? 'Este email ya tiene una cuenta. Iniciá sesión.'
          : 'Error al crear la cuenta. Intentá de nuevo.'
      )
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm px-6 text-center">
        <Link
          href="/"
          className="text-2xl font-black uppercase tracking-[0.25em] text-foreground"
        >
          LUXE.
        </Link>
        <div className="mt-10 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
            Revisá tu email
          </p>
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted">
            Te enviamos un link de confirmación a{' '}
            <span className="text-foreground">{fields.email}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm px-6">

      {/* ─── Logo ─── */}

      <div className="mb-10 text-center">
        <Link
          href="/"
          className="text-2xl font-black uppercase tracking-[0.25em] text-foreground"
        >
          LUXE.
        </Link>
      </div>

      {/* ─── Heading ─── */}

      <h1 className="mb-8 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
        Crear cuenta
      </h1>

      <div className="flex flex-col gap-5">

        {/* ─── Google OAuth ─── */}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-3 border border-border bg-background text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground disabled:opacity-50"
        >
          <GoogleIcon />
          <span>Continuar con Google</span>
        </button>

        {/* ─── Divider ─── */}

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">O</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* ─── Form ─── */}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className={LABEL_CLASS}>
              Nombre
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={fields.name}
              onChange={update('name')}
              placeholder="Tu nombre"
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className={LABEL_CLASS}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={update('email')}
              placeholder="tu@email.com"
              className={errors.email ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
            {errors.email && (
              <p className="mt-1 text-[11px] text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className={LABEL_CLASS}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={fields.password}
              onChange={update('password')}
              placeholder="••••••••"
              className={errors.password ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
            {errors.password && (
              <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className={LABEL_CLASS}>
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={fields.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="••••••••"
              className={errors.confirmPassword ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {globalError && (
            <p className="text-[11px] text-destructive tracking-wide">{globalError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-between bg-foreground px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <span>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
            <ArrowIcon className="text-gold" size={18} />
          </button>
        </form>
      </div>

      {/* ─── Login link ─── */}

      <p className="mt-8 text-center text-[11px] uppercase tracking-[0.15em] text-muted">
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
