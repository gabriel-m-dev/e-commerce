import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { Payment } from 'mercadopago'
import { mp } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'

type MPWebhookBody = {
  type: string
  data?: { id: string | number }
}

function mapMPStatus(mpStatus: string): 'PROCESSING' | 'CANCELLED' | null {
  if (mpStatus === 'approved') return 'PROCESSING'
  if (mpStatus === 'rejected' || mpStatus === 'cancelled') return 'CANCELLED'
  return null
}

function verifySignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true // skip validation in dev if secret not configured

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  const dataId = new URL(request.url).searchParams.get('data.id')

  if (!xSignature) return false

  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const template = `id:${dataId ?? ''};request-id:${xRequestId ?? ''};ts:${ts};`
  const hmac = createHmac('sha256', secret).update(template).digest('hex')

  return hmac === v1
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifySignature(request, rawBody)) {
      console.warn('[webhook/mercadopago] Firma inválida — request rechazada')
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body: MPWebhookBody = JSON.parse(rawBody)
    console.log('[webhook/mercadopago] Notificación recibida:', JSON.stringify(body, null, 2))

    if (body.type !== 'payment') {
      return Response.json({ received: true }, { status: 200 })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      console.warn('[webhook/mercadopago] Notificación de pago sin data.id')
      return Response.json({ received: true }, { status: 200 })
    }

    const paymentClient = new Payment(mp)
    const paymentData = await paymentClient.get({ id: String(paymentId) })

    const externalReference = paymentData.external_reference
    const mpStatus = paymentData.status

    if (!externalReference || !mpStatus) {
      console.warn('[webhook/mercadopago] Pago sin external_reference o status', { externalReference, mpStatus })
      return Response.json({ received: true }, { status: 200 })
    }

    const mappedStatus = mapMPStatus(mpStatus)

    if (mappedStatus) {
      await prisma.order.update({
        where: { id: externalReference },
        data: { status: mappedStatus },
      })
      console.log(`[webhook/mercadopago] Orden ${externalReference} actualizada a ${mappedStatus}`)
    } else {
      console.log(`[webhook/mercadopago] Status MP '${mpStatus}' ignorado para orden ${externalReference}`)
    }
  } catch (error) {
    console.error('[webhook/mercadopago] Error procesando notificación:', error)
  }

  return Response.json({ received: true }, { status: 200 })
}
