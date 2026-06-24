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
  { name: 'Buzos',     slug: 'buzos'      },
  { name: 'Remeras',   slug: 'remeras'    },
  { name: 'Mochilas',  slug: 'mochilas'   },
  { name: 'Pantalones',slug: 'pantalones' },
] as const

// ─── Products ─────────────────────────────────────────────────────────────────

// Prices are stored as integers (ARS, no cents conversion — same value as mock)
const products = [
  {
    name:         'Gorra eMe',
    slug:         'gorra-luxe',
    price:        24900,
    categorySlug: 'gorras',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Diseño limpio, estructura premium. La Gorra eMe está hecha para los que no necesitan explicar su estilo.',
    featured:    true,
    stock:       50,
    brand:       'OTROS' as const,
    colors:      [] as string[],
  },
  {
    name:         'Hoodie Oversize',
    slug:         'hoodie-oversize',
    price:        69900,
    categorySlug: 'buzos',
    images: [
      'https://images.unsplash.com/photo-1639379789831-bbd53e09408d?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Corte oversize, tela pesada, acabado mate. El Hoodie que no se nota que es caro, pero se siente.',
    featured:    true,
    stock:       40,
    brand:       'OTROS' as const,
    colors:      [] as string[],
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
    colors:      [] as string[],
  },
  {
    name:         'Mochila eMe',
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
    colors:      [] as string[],
  },
  {
    name:         'eMe AIR',
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
    brand:       'NIKE' as const,
    colors:      [] as string[],
  },
  {
    name:         'Buzo Esencial',
    slug:         'buzo-esencial',
    price:        54900,
    categorySlug: 'buzos',
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&auto=format&fit=crop&q=85',
    ],
    description: 'Sin logos llamativos. Sin excesos. Solo una silueta perfecta y una tela que dura.',
    featured:    false,
    stock:       45,
    brand:       'OTROS' as const,
    colors:      [] as string[],
  },
  {
    name:         'Pantalón eMe',
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
    colors:      [] as string[],
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
    colors:      [] as string[],
  },
  {
    name:         'Remera Oversize eMe',
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
    colors:      [] as string[],
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
    colors:      [] as string[],
  },
  {
    name:         'Zapatilla eMe Runner',
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
    colors:      [] as string[],
  },
  {
    name:         'Zapatilla eMe Court',
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
    colors:      [] as string[],
  },
  {
    name:         'Mochila Urban eMe',
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
    colors:      [] as string[],
  },
  {
    name:         'Pantalón Cargo eMe',
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
    colors:      [] as string[],
  },
] as const

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const categoryMap = new Map<string, string>()

  if (await prisma.category.count() === 0) {
    console.log('Seeding categories...')
    for (const cat of categories) {
      const upserted = await prisma.category.upsert({
        where:  { slug: cat.slug },
        update: { name: cat.name },
        create: { name: cat.name, slug: cat.slug },
      })
      categoryMap.set(cat.slug, upserted.id)
      console.log(`  Category: ${upserted.name} (${upserted.id})`)
    }
  } else {
    console.log(`Skipping categories — already exist`)
    const existing = await prisma.category.findMany({ select: { id: true, slug: true } })
    for (const cat of existing) categoryMap.set(cat.slug, cat.id)
  }

  const productCount = await prisma.product.count()
  if (productCount === 0) {
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
          colors:      [...p.colors],
          categories: {
            deleteMany: {},
            create: [{ categoryId, isPrimary: true }],
          },
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
          colors:      [...p.colors],
          active:      true,
          categories: {
            create: [{ categoryId, isPrimary: true }],
          },
        },
      })
      console.log(`  Product: ${upserted.name} — $${upserted.price} (${upserted.id})`)
    }
  } else {
    console.log(`Skipping products — ${productCount} already exist`)
  }

  // ─── SiteConfig defaults ──────────────────────────────────────────────────

  if (await prisma.siteConfig.count() === 0) {
    console.log('Seeding site config...')

    const luxeAir = await prisma.product.findUnique({ where: { slug: 'luxe-air' } })

    const heroDefault = {
      slides: [
        { image: '/hero/1.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
        { image: '/hero/2.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
        { image: '/hero/3.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
        { image: '/hero/4.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
      ],
    }

    const categoryCardsDefault = {
      cards: [
        { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85', label: 'Nueva colección', title: 'Zapatillas', subtitle: '5 modelos', link: '/products?category=Zapatillas' },
        { image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85', label: 'Temporada actual', title: 'Ropa', subtitle: 'Buzos · Remeras · Pantalones', link: '/products?category=Buzos,Pantalones,Remeras' },
        { image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85', label: 'Esenciales', title: 'Accesorios', subtitle: 'Gorras · Mochilas', link: '/products?category=Gorras,Mochilas' },
      ],
    }

    await prisma.siteConfig.upsert({
      where: { key: 'hero' },
      update: { value: heroDefault },
      create: { key: 'hero', value: heroDefault },
    })
    console.log('  SiteConfig: hero')

    if (luxeAir) {
      await prisma.siteConfig.upsert({
        where: { key: 'productFeature' },
        update: { value: { productId: luxeAir.id } },
        create: { key: 'productFeature', value: { productId: luxeAir.id } },
      })
      console.log(`  SiteConfig: productFeature (${luxeAir.id})`)
    }

    await prisma.siteConfig.upsert({
      where: { key: 'categoryCards' },
      update: { value: categoryCardsDefault },
      create: { key: 'categoryCards', value: categoryCardsDefault },
    })
    console.log('  SiteConfig: categoryCards')
  } else {
    console.log(`Skipping site config — already exists`)
  }

  // ─── Shipping Methods ──────────────────────────────────────────────────────

  console.log('Seeding shipping methods...')

  await prisma.shippingMethod.upsert({
    where: { id: 'shipping-standard' },
    update: {
      name: 'Envío estándar',
      baseWeightKg: 999,
      baseCostUsd: 16,
      additionalCostPerKgUsd: 0,
      additionalUnitKg: 1,
      active: true,
    },
    create: {
      id: 'shipping-standard',
      name: 'Envío estándar',
      baseWeightKg: 999,
      baseCostUsd: 16,
      additionalCostPerKgUsd: 0,
      additionalUnitKg: 1,
      active: true,
    },
  })
  console.log('  ShippingMethod: Envío estándar (base $16 USD flat rate)')

  await prisma.shippingMethod.upsert({
    where: { id: 'shipping-ems-argentina' },
    update: {
      name: 'EMS',
      description: 'Valor en aduana inferior a $50 — 20 a 50 días hábiles',
      baseWeightKg: 0.5,
      baseCostUsd: 25,
      additionalCostPerKgUsd: 1,
      additionalUnitKg: 0.1,
      active: true,
    },
    create: {
      id: 'shipping-ems-argentina',
      name: 'EMS',
      description: 'Valor en aduana inferior a $50 — 20 a 50 días hábiles',
      baseWeightKg: 0.5,
      baseCostUsd: 25,
      additionalCostPerKgUsd: 1,
      additionalUnitKg: 0.1,
      active: true,
    },
  })
  console.log('  ShippingMethod: EMS (base $25 USD, +$1/0.1kg)')

  await prisma.shippingMethod.upsert({
    where: { id: 'shipping-postnl-argentina' },
    update: {
      name: 'POST NL',
      description: 'Paquetes de menos de 2 kg — 20 a 50 días hábiles',
      baseWeightKg: 0.25,
      baseCostUsd: 8,
      additionalCostPerKgUsd: 2,
      additionalUnitKg: 0.1,
      active: true,
    },
    create: {
      id: 'shipping-postnl-argentina',
      name: 'POST NL',
      description: 'Paquetes de menos de 2 kg — 20 a 50 días hábiles',
      baseWeightKg: 0.25,
      baseCostUsd: 8,
      additionalCostPerKgUsd: 2,
      additionalUnitKg: 0.1,
      active: true,
    },
  })
  console.log('  ShippingMethod: POST NL (base $8 USD, +$2/0.1kg)')

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
