import { Resend } from 'resend'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'

const FROM = process.env.RESEND_FROM ?? `${SITE_NAME} <onboarding@resend.dev>`

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type OrderEmailData = {
  orderId: string
  email: string
  items: { name: string; quantity: number; price: number; size?: string | null }[]
  total: number
  trackingNumber?: string | null
  phone?: string | null
}

function itemsHtml(items: OrderEmailData['items']): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;font-size:12px;color:#0a0a0a;">
          ${escapeHtml(item.name)}${item.size ? ` <span style="color:#8a8a8a;">(${escapeHtml(item.size)})</span>` : ''}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;font-size:12px;color:#8a8a8a;text-align:center;">
          ×${item.quantity}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;font-size:12px;color:#0a0a0a;text-align:right;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('')
}

function phoneRequestBlock(phone?: string | null): string {
  if (phone) return ''
  return `
    <div style="background:#fefce8;border:1px solid #d97706;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d97706;">
        Acción requerida
      </p>
      <p style="margin:0 0 12px;font-size:13px;color:#0a0a0a;line-height:1.6;">
        Necesitamos tu <strong>número de celular</strong> para coordinar la entrega con el correo.
      </p>
      <a href="mailto:${FROM}" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;padding:12px 22px;">
        Respondé con tu número →
      </a>
    </div>`
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid #e5e5e5;">
            <a href="${SITE_URL}" style="text-decoration:none;font-size:20px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;color:#0a0a0a;">
              ${SITE_NAME}
            </a>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #e5e5e5;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#8a8a8a;text-align:center;">
            ${SITE_NAME} · Argentina
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendOrderConfirmedEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">
      Pedido confirmado
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      ¡Gracias por tu compra!
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pago fue aprobado. Estamos preparando tu pedido y te avisaremos cuando sea despachado.
    </p>

    ${phoneRequestBlock(order.phone)}

    <p style="margin:0 0 8px;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#8a8a8a;">
      N° de orden
    </p>
    <p style="margin:0 0 24px;font-size:14px;font-weight:700;color:#0a0a0a;">${shortId}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:left;">Producto</th>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:center;">Cant.</th>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${itemsHtml(order.items)}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0a;">Total</td>
        <td style="font-size:14px;font-weight:900;color:#0a0a0a;text-align:right;">${formatPrice(order.total)}</td>
      </tr>
    </table>

    <a href="${SITE_URL}/account" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Ver mis pedidos →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Pedido confirmado — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendOrderConfirmedEmail failed:', err)
  }
}

export async function sendOrderCancelledEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#dc2626;">
      Pedido cancelado
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Tu pedido fue cancelado
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pedido N° <strong>${shortId}</strong> fue cancelado. Si realizaste un pago,
      el reembolso se procesará según los tiempos de tu banco o billetera virtual.
      Ante cualquier duda, contactanos.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:left;">Producto</th>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:center;">Cant.</th>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${itemsHtml(order.items)}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0a;">Total</td>
        <td style="font-size:14px;font-weight:900;color:#0a0a0a;text-align:right;">${formatPrice(order.total)}</td>
      </tr>
    </table>

    <a href="${SITE_URL}/contact" style="display:inline-block;border:1px solid #0a0a0a;color:#0a0a0a;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Contactarnos
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Pedido cancelado — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendOrderCancelledEmail failed:', err)
  }
}

export async function sendOutForDeliveryEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#f97316;">
      En reparto
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Tu pedido está en camino
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pedido N° <strong>${shortId}</strong> está siendo entregado hoy. El repartidor se pondrá en contacto para coordinar la entrega.
    </p>

    ${phoneRequestBlock(order.phone)}

    ${order.trackingNumber ? `
    <div style="background:#f5f5f5;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;">
        Número de seguimiento
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#0a0a0a;">${order.trackingNumber}</p>
    </div>` : ''}

    <a href="${SITE_URL}/account" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Ver mi pedido →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Tu pedido está en camino — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendOutForDeliveryEmail failed:', err)
  }
}

export async function sendTransferInstructionsEmail(params: {
  to: string
  orderId: string
  total: number
  cbu: string
  alias: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { to, orderId, total, cbu, alias } = params
  const shortId = orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#d97706;">
      Transferencia bancaria
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Instrucciones de pago
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Recibimos tu pedido. Para confirmarlo, realizá la transferencia con los datos que aparecen a continuación.
    </p>

    <div style="background:#f5f5f5;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#8a8a8a;">Datos bancarios</p>

      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#8a8a8a;">CBU</p>
      <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#0a0a0a;font-family:monospace;">${cbu}</p>

      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#8a8a8a;">Alias</p>
      <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#0a0a0a;">${alias}</p>

      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#8a8a8a;">Monto a transferir</p>
      <p style="margin:0 0 16px;font-size:18px;font-weight:900;color:#0a0a0a;">${formatPrice(total)}</p>

      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#8a8a8a;">Referencia del pedido</p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#0a0a0a;">${shortId}</p>
    </div>

    <p style="margin:0 0 24px;font-size:12px;color:#8a8a8a;line-height:1.6;">
      Una vez realizada la transferencia, envianos el comprobante por WhatsApp o email.
      Tu pedido se confirmará en cuanto verifiquemos el pago.
    </p>

    <a href="${SITE_URL}/checkout/transferencia/${orderId}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Ver instrucciones →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Instrucciones de transferencia — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendTransferInstructionsEmail failed:', err)
  }
}

export async function sendTransferConfirmedEmail(params: {
  to: string
  orderId: string
  total: number
  phone?: string | null
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { to, orderId, total, phone } = params
  const shortId = orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">
      Pago confirmado
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      ¡Tu transferencia fue verificada!
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Confirmamos el pago de tu pedido N° <strong>${shortId}</strong>. Estamos preparando tu pedido y te avisaremos cuando sea despachado.
    </p>

    ${phoneRequestBlock(phone)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0a;">Total pagado</td>
        <td style="font-size:14px;font-weight:900;color:#0a0a0a;text-align:right;">${formatPrice(total)}</td>
      </tr>
    </table>

    <a href="${SITE_URL}/account" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Ver mis pedidos →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Transferencia confirmada — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendTransferConfirmedEmail failed:', err)
  }
}

export async function sendOrderProcessingEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#3b82f6;">
      En preparación
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Estamos preparando tu pedido
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pedido N° <strong>${shortId}</strong> está siendo preparado. Te avisaremos en cuanto sea despachado.
    </p>

    ${phoneRequestBlock(order.phone)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:left;">Producto</th>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:center;">Cant.</th>
          <th style="padding:8px 0;border-bottom:2px solid #0a0a0a;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${itemsHtml(order.items)}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0a;">Total</td>
        <td style="font-size:14px;font-weight:900;color:#0a0a0a;text-align:right;">${formatPrice(order.total)}</td>
      </tr>
    </table>

    <a href="${SITE_URL}/account" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Ver mi pedido →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Tu pedido está en preparación — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendOrderProcessingEmail failed:', err)
  }
}

export async function sendOrderShippedEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">
      En camino
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Tu pedido fue despachado
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pedido N° <strong>${shortId}</strong> ya está en camino.
    </p>

    ${phoneRequestBlock(order.phone)}

    ${order.trackingNumber ? `
    <div style="background:#f5f5f5;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;">
        Número de seguimiento
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#0a0a0a;">${order.trackingNumber}</p>
    </div>` : ''}

    <a href="${SITE_URL}/account/orders/${order.orderId}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Seguí el progreso →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Tu pedido fue despachado — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendOrderShippedEmail failed:', err)
  }
}

export async function sendArrivedCountryEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#0ea5e9;">
      Llegó al país
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Tu pedido llegó a Argentina
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pedido N° <strong>${shortId}</strong> llegó al país. Próximamente ingresará a proceso aduanero.
    </p>

    ${phoneRequestBlock(order.phone)}

    ${order.trackingNumber ? `
    <div style="background:#f5f5f5;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;">
        Número de seguimiento
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#0a0a0a;">${order.trackingNumber}</p>
    </div>` : ''}

    <a href="${SITE_URL}/account/orders/${order.orderId}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Seguí el progreso →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Tu pedido llegó al país — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendArrivedCountryEmail failed:', err)
  }
}

export async function sendNationalDistributionEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#8b5cf6;">
      En distribución
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Tu pedido está en distribución nacional
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pedido N° <strong>${shortId}</strong> fue liberado por aduana y está en distribución nacional.
    </p>

    ${phoneRequestBlock(order.phone)}

    ${order.trackingNumber ? `
    <div style="background:#f5f5f5;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;">
        Número de seguimiento
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#0a0a0a;">${order.trackingNumber}</p>
    </div>` : ''}

    <a href="${SITE_URL}/account/orders/${order.orderId}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Seguí el progreso →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Tu pedido está en distribución nacional — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendNationalDistributionEmail failed:', err)
  }
}

export async function sendDeliveredEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const shortId = order.orderId.slice(0, 8).toUpperCase()

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#22c55e;">
      Entregado
    </p>
    <h1 style="margin:0 0 24px;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0a0a;">
      Tu pedido fue entregado
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      Tu pedido N° <strong>${shortId}</strong> fue entregado. Gracias por tu compra.
    </p>

    <a href="${SITE_URL}/account/orders/${order.orderId}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;">
      Ver mi pedido →
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Tu pedido fue entregado — N° ${shortId}`,
      html,
    })
  } catch (err) {
    console.error('[email] sendDeliveredEmail failed:', err)
  }
}
