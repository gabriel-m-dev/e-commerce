export const SITE_NAME = 'LUXE.'
export const SITE_DESCRIPTION = 'Diseño minimalista. Calidad premium.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const SOCIAL_INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com'
export const SOCIAL_FACEBOOK = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? 'https://facebook.com'
export const SOCIAL_TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_URL ?? 'https://tiktok.com'

export const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/products' },
  { label: 'Nosotros', href: '/about' },
  { label: 'Contacto', href: '/contact' },
] as const

export const FEATURED_PRODUCTS_LIMIT = 4
export const PRODUCTS_PER_PAGE = 12
