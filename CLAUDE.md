@AGENTS.md

# Ecommerce — Project Context

## Stack

- **Next.js 16.2.5** (App Router) + **React 19.2.4** + **TypeScript 5**
- **Tailwind CSS v4** — CSS-first, `@theme` block in `globals.css`, no `tailwind.config.js`
- **shadcn/ui** — `components.json` present. Never run `npx shadcn init`. Use `npx shadcn add [component]`.
- **Prisma 7.8.0** — requires `prisma.config.ts` + `PrismaPg` driver adapter; client at `lib/generated/prisma/client.ts`; constructor: `new PrismaClient({ adapter })`
- **Zustand 5** — cart store at `store/cart.ts`
- **MercadoPago 2.4.4** — payment integration
- **NextAuth 4** — authentication

## Breaking Changes (enforce these always)

- `params` and `searchParams` are Promises — must be `await`ed in page/layout components
- Tailwind v4: no config file, use `@theme` in `globals.css` for tokens
- Prisma 7: use `lib/generated/prisma/client.ts`, never `@prisma/client`
- `lib/prisma.ts` is the singleton — import from there

## Design Tokens (`globals.css` @theme)

```
--color-background: #ffffff
--color-foreground: #0a0a0a
--color-surface: #f5f5f5
--color-border: #e5e5e5
--color-muted: #8a8a8a
--color-accent: #0a0a0a
--color-accent-foreground: #ffffff
--color-gold: #c9a96e        ← premium accent
--color-destructive: #dc2626
--radius-sm/md/lg: 0.125/0.25/0.375rem  ← nearly square, minimal
```

Aesthetic: angular, minimalist, uppercase with wide letter-spacing.

## What Exists

### Layout & Global
- `app/layout.tsx` — root layout, metadata SEO, Organization JSON-LD
- `app/globals.css` — Tailwind v4 @theme
- `app/not-found.tsx` — 404
- `app/robots.ts` — robots.txt
- `app/sitemap.ts` — sitemap.xml
- `app/(main)/layout.tsx` — Navbar + Footer + CartDrawer
- `app/(auth)/layout.tsx` — auth layout (no Navbar/Footer)
- `components/layout/Navbar.tsx` — Server Component, sticky, includes `<NavbarSearch />`
- `components/layout/NavbarSearch.tsx` — Client: expandable search, live dropdown (5 results)
- `components/layout/CartIconButton.tsx` — cart button with counter
- `components/layout/MobileMenu.tsx`
- `components/layout/Footer.tsx`

### Pages
- `app/(main)/page.tsx` — Homepage: hero, featured products, brand callout, product feature, features strip, products+filters, CTA, categories
- `app/(main)/products/page.tsx` — Product listing with category/sort/search filters
- `app/(main)/product/[slug]/page.tsx` — Product detail: gallery, breadcrumb, related. `generateMetadata` with JSON-LD Product + BreadcrumbList
- `app/(main)/cart/page.tsx`
- `app/(main)/checkout/page.tsx`
- `app/(main)/checkout/success|failure|pending/page.tsx`
- `app/(main)/admin/page.tsx` — dashboard
- `app/(main)/admin/products/page.tsx`
- `app/(main)/admin/orders/page.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`

### Components
- `components/product/ProductsWithFilters.tsx` — Client: category tabs, sort, search input, product grid, empty state
- `components/product/ProductDetail.tsx` — gallery, sizes, add to cart
- `components/product/ProductFeature.tsx` — feature section for homepage
- `components/product/AddToCartButton.tsx`
- `components/cart/CartDrawer.tsx` — slide-in cart drawer
- `components/auth/SessionProviderWrapper.tsx`
- `components/ui/ArrowIcon.tsx`

### Lib & Data
- `lib/utils.ts` — `cn()`, `formatPrice()`, `formatSlug()`, `truncate()`
- `lib/constants.ts` — `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION`, `NAV_LINKS`
- `lib/prisma.ts` — Prisma singleton (PrismaPg adapter)
- `lib/mercadopago.ts` — MercadoPago client
- `lib/data/products.ts` — `MOCK_PRODUCTS` (8), `PRODUCT_CATEGORIES`, `SIZES_BY_CATEGORY` ← **temporary**
- `store/cart.ts` — Zustand cart (add, remove, updateQuantity, clear)
- `types/index.ts` — domain types

### Prisma
- `prisma/schema.prisma` — User, Category, Product, CartItem, Order, OrderItem, Address, enum OrderStatus
- `prisma/seed.ts` — 6 categories, 8 products
- `prisma.config.ts` — datasource URL
- `lib/generated/prisma/` — generated client (use this, not `@prisma/client`)

### API Routes
- `app/api/checkout/create-preference/route.ts` — creates MercadoPago preference
- `app/api/webhook/mercadopago/route.ts` — MP webhook
- `app/api/auth/[...nextauth]/route.ts` — NextAuth

## DB Status — BLOCKED

`.env` has a placeholder `DATABASE_URL`. Pages use `MOCK_PRODUCTS` until a real DB is connected.

**When user provides a real DATABASE_URL:**
1. `npx prisma migrate dev --name init`
2. `npx prisma db seed`
3. Create `lib/queries/products.ts` with `getProducts`, `getProductBySlug`, `getFeaturedProducts`
4. Replace `MOCK_PRODUCTS` imports in pages with Prisma queries

## Completed Phases

| Phase | Status |
|-------|--------|
| 1 — Foundation (structure, types, utils, layout) | Complete |
| 2 — Product pages + SEO | UI complete, DB pending |
| 3 — Cart + Checkout + MercadoPago | Complete (UI) |
| 4 — Auth (NextAuth) | Complete (UI, DB pending) |
| 5 — Admin dashboard | Complete (UI, DB pending) |
| 6 — SEO & Performance | Pending |
| 7 — Polish & Scale | Pending |
