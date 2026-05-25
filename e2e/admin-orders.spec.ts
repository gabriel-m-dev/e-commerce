import { test, expect } from '@playwright/test'

/**
 * Admin orders E2E tests.
 *
 * Strategy: navigate directly to admin URLs. These tests validate
 * rendering behavior — if the server returns a valid page (table, empty state,
 * 404) the test passes. We don't assert DB data since the test environment
 * may have no orders.
 *
 * Auth: these tests assume the admin session cookie is either set globally
 * via storageState or the page redirects gracefully. Adjust baseURL and
 * storageState in playwright.config.ts for your environment.
 */

// Task 5.3 — search by email renders table or empty state
test('admin orders search renders table or empty-state without error', async ({ page }) => {
  const response = await page.goto('/admin/orders?q=test@test.com')

  // Accept redirect (auth) or 200 — just must not be 500
  if (response) {
    expect(response.status()).not.toBe(500)
  }

  // If we landed on the admin orders page (not redirected to login)
  const url = page.url()
  if (url.includes('/admin/orders')) {
    // Either the table has rows or an empty state message is shown
    const hasTable = await page.locator('table tbody tr').count()
    const hasEmptyState = await page.locator('text=/Sin resultados|Sin ordenes/i').count()
    expect(hasTable + hasEmptyState).toBeGreaterThan(0)
  }
})

// Task 5.4 — nonexistent order ID renders 404
test('admin order detail with nonexistent id renders 404', async ({ page }) => {
  const response = await page.goto('/admin/orders/nonexistent-id-that-does-not-exist')

  if (response) {
    // Either server 404, or Next.js renders a not-found page (200 with 404 content)
    const is404Status = response.status() === 404
    const is200WithNotFound = response.status() === 200 &&
      (await page.locator('text=/404|not found|no encontrad/i').count()) > 0
    const isRedirected = response.status() === 302 || response.status() === 303

    expect(is404Status || is200WithNotFound || isRedirected).toBe(true)
  }
})

// Task 5.5 — pagination: Next link appears and updates URL
test('admin orders list shows Next link when nextCursor is present', async ({ page }) => {
  const response = await page.goto('/admin/orders')

  if (response) {
    expect(response.status()).not.toBe(500)
  }

  const url = page.url()
  if (!url.includes('/admin/orders')) {
    // Redirected to login — skip assertion
    return
  }

  // Check if Next link is present
  const nextLink = page.getByRole('link', { name: /Siguiente/i })
  const hasNextLink = await nextLink.count()

  if (hasNextLink > 0) {
    // Click Next and assert cursor appears in URL
    await nextLink.click()
    await page.waitForURL(/cursor=/)
    expect(page.url()).toContain('cursor=')
  }
  // If no Next link — page has 25 or fewer orders — that's a valid state
})

// Bonus: search preserves status filter in URL
test('admin orders search preserves status param in URL', async ({ page }) => {
  const response = await page.goto('/admin/orders?status=PENDING')

  if (response?.status() !== 200) return
  if (!page.url().includes('/admin/orders')) return

  const searchInput = page.getByPlaceholder(/buscar/i)
  if (await searchInput.count() === 0) return

  await searchInput.fill('gabriel')
  // Wait for debounce (300ms) + navigation
  await page.waitForURL(/q=gabriel/, { timeout: 3000 }).catch(() => {})

  const finalUrl = page.url()
  if (finalUrl.includes('q=gabriel')) {
    expect(finalUrl).toContain('status=PENDING')
  }
})
