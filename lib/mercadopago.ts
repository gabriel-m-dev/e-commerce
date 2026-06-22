import { MercadoPagoConfig, Preference } from 'mercadopago'

const BOM = '\u{FEFF}'

export const mp = new MercadoPagoConfig({
  accessToken: (process.env.MP_ACCESS_TOKEN ?? '').replace(new RegExp('^' + BOM), '').trim(),
})

export { Preference }
