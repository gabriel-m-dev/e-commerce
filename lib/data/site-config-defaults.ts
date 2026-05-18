export type HeroSlide = {
  image: string
  label: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

export type CategoryCard = {
  image: string
  label: string
  title: string
  subtitle: string
  link: string
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { image: '/hero/1.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
  { image: '/hero/2.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
  { image: '/hero/3.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
  { image: '/hero/4.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
]

export const DEFAULT_CATEGORY_CARDS: CategoryCard[] = [
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85',
    label: 'Nueva colección',
    title: 'Zapatillas',
    subtitle: '5 modelos',
    link: '/products?category=Zapatillas',
  },
  {
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
    label: 'Temporada actual',
    title: 'Ropa',
    subtitle: 'Hoodies · Remeras · Pantalones',
    link: '/products?category=Hoodies',
  },
  {
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85',
    label: 'Esenciales',
    title: 'Accesorios',
    subtitle: 'Gorras · Mochilas',
    link: '/products?category=Gorras',
  },
]
