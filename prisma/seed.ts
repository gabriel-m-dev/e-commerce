import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

// ─── Categories ───────────────────────────────────────────────────────────────

const categories = [
  { name: 'Zapatillas', slug: 'zapatillas' },
  { name: 'Gorras',     slug: 'gorras'     },
  { name: 'Hoodies',   slug: 'hoodies'    },
  { name: 'Remeras',   slug: 'remeras'    },
  { name: 'Mochilas',  slug: 'mochilas'   },
  { name: 'Pantalones',slug: 'pantalones' },
] as const

// ─── Products ─────────────────────────────────────────────────────────────────

// Prices are stored as integers (ARS, no cents conversion — same value as mock)
const products = [
  {
    name:         'Gorra LUXE.',
    slug:         'gorra-luxe',
    price:        24900,
    categorySlug: 'gorras',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Diseño limpio, estructura premium. La Gorra LUXE. está hecha para los que no necesitan explicar su estilo.',
    featured:    true,
    stock:       50,
    brand:       'OTROS' as const,
  },
  {
    name:         'Hoodie Oversize',
    slug:         'hoodie-oversize',
    price:        69900,
    categorySlug: 'hoodies',
    images: [
      'https://images.unsplash.com/photo-1639379789831-bbd53e09408d?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Corte oversize, tela pesada, acabado mate. El Hoodie que no se nota que es caro, pero se siente.',
    featured:    true,
    stock:       40,
    brand:       'OTROS' as const,
  },
  {
    name:         'Remera Premium',
    slug:         'remera-premium',
    price:        29900,
    categorySlug: 'remeras',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Algodón peinado 220g/m². Cuando la simpleza es intencional, se llama diseño.',
    featured:    true,
    stock:       60,
    brand:       'OTROS' as const,
  },
  {
    name:         'Mochila LUXE.',
    slug:         'mochila-luxe',
    price:        59900,
    categorySlug: 'mochilas',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Compartimentos inteligentes, materiales resistentes, estética sin concesiones. Para ir a cualquier lado sin sacrificar el look.',
    featured:    true,
    stock:       25,
    brand:       'OTROS' as const,
  },
  {
    name:         'LUXE AIR',
    slug:         'luxe-air',
    price:        119900,
    categorySlug: 'zapatillas',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Diseñadas para quienes buscan estilo, comodidad y calidad en cada paso. Suela ultraligera, upper de malla técnica.',
    featured:    false,
    stock:       30,
    brand:       'OTROS' as const,
  },
  {
    name:         'Buzo Esencial',
    slug:         'buzo-esencial',
    price:        54900,
    categorySlug: 'hoodies',
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Sin logos llamativos. Sin excesos. Solo una silueta perfecta y una tela que dura.',
    featured:    false,
    stock:       45,
    brand:       'OTROS' as const,
  },
  {
    name:         'Pantalón LUXE.',
    slug:         'pantalon-luxe',
    price:        44900,
    categorySlug: 'pantalones',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Corte recto, caída perfecta. El pantalón que no tenés que pensar dos veces antes de ponerte.',
    featured:    false,
    stock:       35,
    brand:       'OTROS' as const,
  },
  {
    name:         'Gorra Snapback',
    slug:         'gorra-snapback',
    price:        19900,
    categorySlug: 'gorras',
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1556306535-38febf6d5fd0?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Cierre snapback ajustable, visera plana, bordado minimal. Clásico sin esfuerzo.',
    featured:    false,
    stock:       55,
    brand:       'OTROS' as const,
  },
  {
    name:         'Remera Oversize LUXE.',
    slug:         'remera-oversize-luxe',
    price:        34900,
    categorySlug: 'remeras',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Corte oversize estructurado, algodón compacto 200g/m². La remera que te hace ver que estás pensando en todo.',
    featured:    false,
    stock:       45,
    brand:       'OTROS' as const,
  },
  {
    name:         'Remera Esencial Negra',
    slug:         'remera-esencial-negra',
    price:        24900,
    categorySlug: 'remeras',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Negro puro, cuello redondo reforzado, sin texto. La base de cualquier outfit que sabe a qué va.',
    featured:    false,
    stock:       60,
    brand:       'OTROS' as const,
  },
  {
    name:         'Zapatilla LUXE. Runner',
    slug:         'zapatilla-luxe-runner',
    price:        109900,
    categorySlug: 'zapatillas',
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Perfil bajo, suela de goma vulcanizada, upper de nylon técnico. Velocidad sin alardes.',
    featured:    false,
    stock:       25,
    brand:       'OTROS' as const,
  },
  {
    name:         'Zapatilla LUXE. Court',
    slug:         'zapatilla-luxe-court',
    price:        129900,
    categorySlug: 'zapatillas',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Inspirada en las canchas, refinada para la calle. Cuero sintético premium con forro acolchado.',
    featured:    false,
    stock:       20,
    brand:       'OTROS' as const,
  },
  {
    name:         'Mochila Urban LUXE.',
    slug:         'mochila-urban-luxe',
    price:        69900,
    categorySlug: 'mochilas',
    images: [
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Capacidad 20L, correas acolchadas, compartimento laptop 15". Minimalismo que carga lo que necesitás.',
    featured:    false,
    stock:       30,
    brand:       'OTROS' as const,
  },
  {
    name:         'Pantalón Cargo LUXE.',
    slug:         'pantalon-cargo-luxe',
    price:        54900,
    categorySlug: 'pantalones',
    images: [
      'https://images.unsplash.com/photo-1519098635131-4c8f806d1e83?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Bolsillos funcionales, tela ripstop liviana, corte relaxed. El pantalón de quienes van a todos lados.',
    featured:    false,
    stock:       35,
    brand:       'OTROS' as const,
  },
] as const

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding categories...')

  // Upsert categories
  const categoryMap = new Map<string, string>()

  for (const cat of categories) {
    const upserted = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    })
    categoryMap.set(cat.slug, upserted.id)
    console.log(`  Category: ${upserted.name} (${upserted.id})`)
  }

  console.log('Seeding products...')

  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug)
    if (!categoryId) throw new Error(`Category not found for slug: ${p.categorySlug}`)

    const upserted = await prisma.product.upsert({
      where:  { slug: p.slug },
      update: {
        name:        p.name,
        price:       p.price,
        images:      [...p.images],
        description: p.description,
        featured:    p.featured,
        stock:       p.stock,
        brand:       p.brand,
        categoryId,
      },
      create: {
        name:        p.name,
        slug:        p.slug,
        price:       p.price,
        images:      [...p.images],
        description: p.description,
        featured:    p.featured,
        stock:       p.stock,
        brand:       p.brand,
        active:      true,
        categoryId,
      },
    })
    console.log(`  Product: ${upserted.name} — $${upserted.price} (${upserted.id})`)
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
