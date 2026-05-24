import { test, expect } from '@playwright/test'

/**
 * Smoke tests — navigation and page loading.
 * These must be fast and always green before any other E2E suite.
 */

test.describe('Homepage', () => {
  test('loads with LUXE. in the title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/LUXE/i)
  })

  test('renders the hero section', async ({ page }) => {
    await page.goto('/')
    // HeroSection renders a <section> or a container — look for any heading/link with LUXE
    // The hero slides contain images; wait for the page to be visually ready
    await page.waitForLoadState('domcontentloaded')
    // Navbar always shows "LUXE." as the brand link
    await expect(page.getByRole('link', { name: /LUXE/i }).first()).toBeVisible()
  })

  test('featured products section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText('PRODUCTOS DESTACADOS', { exact: false })
    ).toBeVisible()
  })

  test('cart icon button is present in the navbar', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: /Abrir carrito/i })
    ).toBeVisible()
  })
})

test.describe('Brand pages', () => {
  test('Jordan brand page — URL and products section', async ({ page }) => {
    await page.goto('/products?brand=JORDAN')
    await expect(page).toHaveURL(/brand=JORDAN/i)
    // The editorial page renders a <main> with product grid content
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('main')).toBeVisible()
    // Confirm Jordan watermark text is rendered
    await expect(page.getByText('JORDAN', { exact: true }).first()).toBeVisible()
  })

  test('Nike brand page — URL and products section', async ({ page }) => {
    await page.goto('/products?brand=NIKE')
    await expect(page).toHaveURL(/brand=NIKE/i)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByText('NIKE', { exact: true }).first()).toBeVisible()
  })

  test('Adidas brand page — URL and products section', async ({ page }) => {
    await page.goto('/products?brand=ADIDAS')
    await expect(page).toHaveURL(/brand=ADIDAS/i)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByText('ADIDAS', { exact: true }).first()).toBeVisible()
  })
})

test.describe('Nuevos Ingresos', () => {
  test('page loads and shows heading', async ({ page }) => {
    await page.goto('/nuevos-ingresos')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(
      page.getByText('Nuevos Ingresos', { exact: false })
    ).toBeVisible()
  })
})

test.describe('Products catalog', () => {
  test('/products shows "Todos los productos" label', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('domcontentloaded')
    // Non-editorial view shows this label
    await expect(
      page.getByText('Todos los productos', { exact: false })
    ).toBeVisible()
  })
})

test.describe('404 page', () => {
  test('unknown route shows not-found content', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-xyz')
    // Next.js returns 404 status for unmatched routes with a not-found page
    expect(response?.status()).toBe(404)
    // The not-found page should have some content rendered
    await page.waitForLoadState('domcontentloaded')
    const body = await page.locator('body').textContent()
    expect(body?.length).toBeGreaterThan(0)
  })
})
