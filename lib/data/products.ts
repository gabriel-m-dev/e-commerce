export type MockProduct = {
  id: string
  name: string
  slug: string
  price: number
  category: string
  image: string
  images: string[]
  description: string
  featured?: boolean
  colors?: string[]
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    name: 'Gorra LUXE.',
    slug: 'gorra-luxe',
    price: 24900,
    category: 'Gorras',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Diseño limpio, estructura premium. La Gorra LUXE. está hecha para los que no necesitan explicar su estilo.',
    featured: true,
  },
  {
    id: '2',
    name: 'Hoodie Oversize',
    slug: 'hoodie-oversize',
    price: 69900,
    category: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1639379789831-bbd53e09408d?q=80&w=435&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1639379789831-bbd53e09408d?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Corte oversize, tela pesada, acabado mate. El Hoodie que no se nota que es caro, pero se siente.',
    featured: true,
  },
  {
    id: '3',
    name: 'Remera Premium',
    slug: 'remera-premium',
    price: 29900,
    category: 'Remeras',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Algodón peinado 220g/m². Cuando la simpleza es intencional, se llama diseño.',
    featured: true,
  },
  {
    id: '4',
    name: 'Mochila LUXE.',
    slug: 'mochila-luxe',
    price: 59900,
    category: 'Mochilas',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Compartimentos inteligentes, materiales resistentes, estética sin concesiones. Para ir a cualquier lado sin sacrificar el look.',
    featured: true,
  },
  {
    id: '5',
    name: 'LUXE AIR',
    slug: 'luxe-air',
    price: 119900,
    category: 'Zapatillas',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Diseñadas para quienes buscan estilo, comodidad y calidad en cada paso. Suela ultraligera, upper de malla técnica.',
  },
  {
    id: '6',
    name: 'Buzo Esencial',
    slug: 'buzo-esencial',
    price: 54900,
    category: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Sin logos llamativos. Sin excesos. Solo una silueta perfecta y una tela que dura.',
  },
  {
    id: '7',
    name: 'Pantalón LUXE.',
    slug: 'pantalon-luxe',
    price: 44900,
    category: 'Pantalones',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Corte recto, caída perfecta. El pantalón que no tenés que pensar dos veces antes de ponerte.',
  },
  {
    id: '8',
    name: 'Gorra Snapback',
    slug: 'gorra-snapback',
    price: 19900,
    category: 'Gorras',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1556306535-38febf6d5fd0?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Cierre snapback ajustable, visera plana, bordado minimal. Clásico sin esfuerzo.',
  },
]

export const FEATURED_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.featured)

export const PRODUCT_CATEGORIES = [
  'Todo',
  'Gorras',
  'Hoodies',
  'Remeras',
  'Mochilas',
  'Zapatillas',
  'Pantalones',
] as const

export const SIZES_BY_CATEGORY: Record<string, string[]> = {
  zapatillas: ['38', '39', '40', '41', '42', '43'],
  hoodies: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  remeras: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  pantalones: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  gorras: [],
  mochilas: [],
}

export const LUXE_AIR_THUMBNAILS = MOCK_PRODUCTS.find(
  (p) => p.slug === 'luxe-air'
)!.images
