'use client'

import { useActionState } from 'react'
import { sendContactEmail, type ContactFormState } from '@/app/(main)/contact/actions'
import ArrowIcon from '@/components/ui/ArrowIcon'

const INPUT_CLASS =
  'border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-foreground focus:outline-none transition-colors w-full'

const LABEL_CLASS =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground mb-2 block'

const initialState: ContactFormState = {}

export default function ContactForm() {
  const [state, action, isPending] = useActionState(sendContactEmail, initialState)

  if (state.success) {
    return (
      <div className="border border-border bg-surface p-10 text-center">
        <div className="mx-auto mb-4 h-px w-8 bg-gold" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
          Mensaje enviado
        </p>
        <p className="mt-2 text-[12px] text-muted">
          Gracias por escribirnos. Te respondemos en menos de 24 horas hábiles.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL_CLASS}>
            Nombre <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Tu nombre"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={LABEL_CLASS}>
          Asunto
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="¿De qué se trata tu consulta?"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="message" className={LABEL_CLASS}>
          Mensaje <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Escribí tu consulta..."
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      {state.error && (
        <p className="text-[11px] text-destructive tracking-wide">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 w-full items-center justify-between bg-foreground px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        <span>{isPending ? 'Enviando...' : 'Enviar mensaje'}</span>
        <ArrowIcon className="text-gold" size={18} />
      </button>
    </form>
  )
}
