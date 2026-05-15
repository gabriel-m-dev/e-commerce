export const SITE_NAME = 'LUXE.'
export const SITE_DESCRIPTION = 'Diseño minimalista. Calidad premium.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const SOCIAL_INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com'
export const SOCIAL_FACEBOOK = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? 'https://facebook.com'
export const SOCIAL_TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_URL ?? 'https://tiktok.com'

export type NavLink = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Inicio', href: '/' },
  {
    label: 'Productos',
    href: '/products',
    children: [
      { label: 'Todos los productos', href: '/products' },
      { label: 'Ofertas', href: '/ofertas' },
      { label: 'Nuevos ingresos', href: '/nuevos-ingresos' },
      { label: 'Nike',   href: '/products?brand=nike'   },
      { label: 'Jordan', href: '/products?brand=jordan' },
      { label: 'Adidas', href: '/products?brand=adidas' },
    ],
  },
  {
    label: 'Nosotros',
    href: '/about',
    children: [
      { label: 'Nuestra historia', href: '/about' },
      { label: 'Trabajá con nosotros', href: '/jobs' },
    ],
  },
  {
    label: 'Ayuda',
    href: '/faq',
    children: [
      { label: 'Preguntas frecuentes', href: '/faq' },
      { label: 'Cambios y devoluciones', href: '/returns' },
      { label: 'Envíos', href: '/shipping' },
    ],
  },
  { label: 'Contacto', href: '/contact' },
]

export const FEATURED_PRODUCTS_LIMIT = 4
export const PRODUCTS_PER_PAGE = 12
