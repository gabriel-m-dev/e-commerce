'use server'

import { Resend } from 'resend'
import { SITE_NAME } from '@/lib/constants'

const FROM = process.env.RESEND_FROM ?? `${SITE_NAME} <onboarding@resend.dev>`

export type ContactFormState = {
  success?: boolean
  error?: string
}

export async function sendContactEmail(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const subject = (formData.get('subject') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!name || !email || !message) {
    return { error: 'Completá todos los campos obligatorios.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'El email ingresado no es válido.' }
  }

  if (message.length < 10) {
    return { error: 'El mensaje es demasiado corto.' }
  }

  if (!process.env.RESEND_API_KEY) {
    console.log('[contact] RESEND_API_KEY no configurada — mensaje recibido:', { name, email, subject, message })
    return { success: true }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: FROM,
    to: 'hola@luxe.com',
    replyTo: email,
    subject: subject ? `[Contacto] ${subject}` : `[Contacto] Mensaje de ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
  })

  if (error) {
    console.error('[contact] Error Resend:', error)
    return { error: 'Error al enviar el mensaje. Intentá de nuevo en unos minutos.' }
  }

  return { success: true }
}
