import { test, expect } from '@playwright/test'

/**
 * Cart flow tests.
 *
 * Strategy: inject a fake product directly into localStorage (Zustand persist
 * key: 'luxe-cart') before page load, then reload so Zustand hydrates from it.
 * This avoids relying on real products loading from the DB or UI click chains.
 *
 * The injected product shape matches CartItem: { product: CartProduct, quantity }.
 * CartProduct fields: id, name, slug, price, image, category, stock.
 */

/** Inject a fake product into the Zustand 'luxe-cart' localStorage key. */
async function injectCartProduct(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const cartState = {
      state: {
        items: [
          {
            product: {
              id: 'test-product-e2e',
              name: 'TEST PRODUCT E2E',
              slug: 'test-product-e2e',
              price: 10000,
              image: '/placeholder.jpg',
              category: 'Zapatillas',
              stock: 10,
            },
            size: undefined,
            color: undefined,
            quantity: 1,
          },
        ],
        isOpen: false,
      },
      version: 0,
    }
    localStorage.setItem('luxe-cart', JSON.stringify(cartState))
  })
}

test.describe('Cart drawer', () => {
  test('opens when cart icon is clicked', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const cartButton = page.getByRole('button', { name: /Abrir carrito/i })
    await cartButton.click()

    // Drawer has role="dialog" and aria-label="Carrito de compras"
    const drawer = page.getByRole('dialog', { name: /Carrito de compras/i })
    await expect(drawer).toBeVisible()
  })

  test('shows empty state message when cart has no items', async ({ page }) => {
    await page.goto('/')
    // Ensure cart is empty
    await page.evaluate(() => localStorage.removeItem('luxe-cart'))
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: /Abrir carrito/i }).click()

    const drawer = page.getByRole('dialog', { name: /Carrito de compras/i })
    await expect(drawer).toBeVisible()

    // Empty cart message
    await expect(
      drawer.getByText(/Tu carrito está vacío/i)
    ).toBeVisible()
  })

  test('closes when the close button is clicked', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: /Abrir carrito/i }).click()
    const drawer = page.getByRole('dialog', { name: /Carrito de compras/i })
    await expect(drawer).toBeVisible()

    await page.getByRole('button', { name: /Cerrar carrito/i }).click()
    // Drawer slides out — it's still in DOM but translated off-screen
    await expect(drawer).not.toBeInViewport()
  })

  test('add product to cart — cart count increments in navbar', async ({ page }) => {
    // Inject fake product via localStorage, then reload so Zustand hydrates
    await page.goto('/')
    await injectCartProduct(page)
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // The badge <span> is conditionally rendered only when mounted && itemCount > 0.
    const cartButton = page.getByRole('button', { name: /Abrir carrito/i })
    const badge = cartButton.locator('span')
    await expect(badge).toBeVisible({ timeout: 10000 })
    const badgeText = await badge.textContent()
    expect(Number(badgeText)).toBeGreaterThanOrEqual(1)
  })

  test('added product appears in cart drawer', async ({ page }) => {
    // Inject fake product via localStorage, then reload so Zustand hydrates
    await page.goto('/')
    await injectCartProduct(page)
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Open cart
    await page.getByRole('button', { name: /Abrir carrito/i }).click()
    const drawer = page.getByRole('dialog', { name: /Carrito de compras/i })
    await expect(drawer).toBeVisible({ timeout: 10000 })

    // Injected product name: "TEST PRODUCT E2E" — match first 10 chars
    await expect(
      drawer.getByText(/TEST PRODUC/i)
    ).toBeVisible()

    // Subtotal label should appear (items > 0)
    await expect(drawer.getByText(/Subtotal/i)).toBeVisible()
  })

  test('remove product from cart — cart becomes empty', async ({ page }) => {
    // Inject fake product via localStorage, then reload so Zustand hydrates
    await page.goto('/')
    await injectCartProduct(page)
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Open cart
    await page.getByRole('button', { name: /Abrir carrito/i }).click()
    const drawer = page.getByRole('dialog', { name: /Carrito de compras/i })
    await expect(drawer).toBeVisible({ timeout: 10000 })

    // Click the delete button (red trash icon) — aria-label: "Eliminar {name}"
    const deleteButton = drawer.getByRole('button', { name: /Eliminar/i }).first()
    await deleteButton.click()

    // A confirmation appears — click the green confirm button
    const confirmButton = drawer.getByRole('button', { name: /Confirmar eliminación/i })
    await expect(confirmButton).toBeVisible()
    await confirmButton.click()

    // Cart should now be empty
    await expect(drawer.getByText(/Tu carrito está vacío/i)).toBeVisible()
  })

  test('cart persists across page navigation', async ({ page }) => {
    // Inject fake product via localStorage, then reload so Zustand hydrates
    await page.goto('/')
    await injectCartProduct(page)
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to a different page
    await page.goto('/products')
    await page.waitForLoadState('domcontentloaded')

    // Cart badge should still reflect item count (localStorage persists across navigation).
    const cartButton = page.getByRole('button', { name: /Abrir carrito/i })
    const badge = cartButton.locator('span')
    await expect(badge).toBeVisible({ timeout: 10000 })
    const count = await badge.textContent()
    expect(Number(count)).toBeGreaterThanOrEqual(1)
  })
})
