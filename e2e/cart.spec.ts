import { test, expect } from '@playwright/test'

/**
 * Cart flow tests.
 *
 * Strategy: navigate to /products (non-editorial), find the first
 * "Agregar X al carrito" button, and interact with the CartDrawer.
 *
 * The cart is driven by Zustand persisted in localStorage, so state
 * survives navigation within the same browser context.
 */

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
    await page.goto('/products')
    await page.waitForLoadState('domcontentloaded')

    // Find the first visible "Agregar X al carrito" button
    const addButtons = page.getByRole('button', { name: /Agregar .+ al carrito/i })
    const firstAdd = addButtons.first()
    await firstAdd.waitFor({ state: 'visible' })
    await firstAdd.click()

    // After adding, the navbar cart icon should show a badge with count >= 1.
    // The badge <span> is conditionally rendered only when mounted && itemCount > 0.
    const badge = page.locator('button[aria-label="Abrir carrito"] > span')
    await expect(badge).toBeVisible({ timeout: 10000 })
    const badgeText = await badge.textContent()
    expect(Number(badgeText)).toBeGreaterThanOrEqual(1)
  })

  test('added product appears in cart drawer', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('domcontentloaded')

    // Get product name before clicking add
    const addButton = page.getByRole('button', { name: /Agregar .+ al carrito/i }).first()
    await addButton.waitFor({ state: 'visible' })

    // Extract product name from aria-label: "Agregar {name} al carrito"
    const ariaLabel = await addButton.getAttribute('aria-label') ?? ''
    const productName = ariaLabel.replace(/^Agregar\s+/i, '').replace(/\s+al carrito$/i, '')

    await addButton.click()

    // Open cart
    await page.getByRole('button', { name: /Abrir carrito/i }).click()
    const drawer = page.getByRole('dialog', { name: /Carrito de compras/i })
    await expect(drawer).toBeVisible({ timeout: 10000 })

    // Product name should appear in the drawer (truncated — use partial match)
    // Names are uppercase in the cart
    if (productName) {
      await expect(
        drawer.getByText(new RegExp(productName.slice(0, 10), 'i'))
      ).toBeVisible()
    }

    // Subtotal label should appear (items > 0)
    await expect(drawer.getByText(/Subtotal/i)).toBeVisible()
  })

  test('remove product from cart — cart becomes empty', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('domcontentloaded')

    // Add a product
    const addButton = page.getByRole('button', { name: /Agregar .+ al carrito/i }).first()
    await addButton.waitFor({ state: 'visible' })
    await addButton.click()

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
    await page.goto('/products')
    await page.waitForLoadState('domcontentloaded')

    // Add product
    const addButton = page.getByRole('button', { name: /Agregar .+ al carrito/i }).first()
    await addButton.waitFor({ state: 'visible' })
    await addButton.click()

    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Cart badge should still reflect item count.
    // Use direct child selector — badge <span> is a direct child of the button.
    const badge = page.locator('button[aria-label="Abrir carrito"] > span')
    await expect(badge).toBeVisible({ timeout: 10000 })
    const count = await badge.textContent()
    expect(Number(count)).toBeGreaterThanOrEqual(1)
  })
})
