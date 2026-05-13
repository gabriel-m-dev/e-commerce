# LUXE. demo web

Tienda demo hecha con `Next.js 16`, `Prisma`, `Supabase` y `Mercado Pago`.

## Requisitos

- Node.js 20+
- Variables de entorno cargadas

## Variables necesarias

Copiá `.env.example` a `.env.local` y completá:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `MP_ACCESS_TOKEN`
- `MP_PUBLIC_KEY`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`
- `NEXT_PUBLIC_TIKTOK_URL`

## Desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run start
```

El proyecto ejecuta `prisma generate` en `postinstall` para que el deploy regenere el cliente automáticamente.

## Deploy recomendado

La opción más simple para esta demo es `Vercel` con:

- Root directory: repositorio actual
- Build command: `npm run build`
- Install command: `npm install`
- Output: automático de Next.js

Antes de publicar:

- No subir `.env`, `.env.local`, `.claude/`, `.playwright-mcp/`, `AGENTS.md` ni `CLAUDE.md`
- Configurar en la plataforma las variables del `.env.example`
- Definir `NEXT_PUBLIC_SITE_URL` con la URL final del deploy
