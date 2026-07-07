import { test, expect } from '@playwright/test';

test('language switcher opens and shows language options', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');

  // Click the language switcher
  const switcher = page.locator('[data-testid="language-switcher"] button').first();
  await expect(switcher).toBeVisible();
  await switcher.click();

  // Verify language dropdown opens
  await expect(page.locator('text=Español')).toBeVisible();
  await expect(page.locator('text=Français')).toBeVisible();
  await expect(page.locator('text=Deutsch')).toBeVisible();
  await expect(page.locator('text=日本語')).toBeVisible();
});

test('switching to Spanish translates the UI', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');

  // Click language switcher
  const switcher = page.locator('[data-testid="language-switcher"] button').first();
  await switcher.click();

  // Select Spanish
  await page.locator('text=Español').click();

  // Verify UI translated
  await expect(page.locator('text=Bienvenido a Canopy')).toBeVisible();
  await expect(page.locator('text=Todos los Proyectos')).toBeVisible();
});

test('switching to Japanese translates the UI', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');

  // Click language switcher
  const switcher = page.locator('[data-testid="language-switcher"] button').first();
  await switcher.click();

  // Select Japanese
  await page.locator('text=日本語').click();

  // Verify UI translated
  await expect(page.locator('text=Canopyへようこそ')).toBeVisible();
});

test('language preference persists after page reload', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');

  // Switch to French
  const switcher = page.locator('[data-testid="language-switcher"] button').first();
  await switcher.click();
  await page.locator('text=Français').click();

  // Verify French
  await expect(page.locator('text=Bienvenue sur Canopy')).toBeVisible();

  // Reload page
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Should still be French
  await expect(page.locator('text=Bienvenue sur Canopy')).toBeVisible();
});
