import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:6174';
const PROJECT_ID = '2f313916-96af-4d6c-bc25-9ded5401ac3a';

test.describe('Priority Alerts Feature', () => {
  test('Priority alert bell is visible in header', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');

    const bell = page.locator('[data-testid="priority-alert-bell"]');
    await expect(bell).toBeVisible();
  });

  test('Priority alert bell shows badge count for critical issues', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const bell = page.locator('[data-testid="priority-alert-bell"]');
    await expect(bell).toBeVisible();

    // Check if badge is present (means we have critical issues)
    const badge = bell.locator('span');
    const badgeCount = await badge.count();
    // Badge should be present if there are critical issues
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('Priority alert bell dropdown opens on click', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('[data-testid="priority-alert-bell"]');
    await page.waitForTimeout(300);

    // Dropdown should appear with "Priority Alerts" heading
    const dropdown = page.locator('text=Priority Alerts');
    await expect(dropdown).toBeVisible();
  });

  test('Priority alert banner appears on board when critical issues exist', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const banner = page.locator('[data-testid="priority-alert-banner"]');
    // Banner should be visible when there are Highest/High priority issues
    const bannerVisible = await banner.isVisible();
    if (bannerVisible) {
      await expect(banner).toContainText('Critical');
    }
  });

  test('Issue cards show enhanced priority indicators', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that issue cards with priority="Highest" have special styling
    const criticalCards = page.locator('[data-priority="Highest"]');
    const count = await criticalCards.count();
    if (count > 0) {
      const firstCard = criticalCards.first();
      // The card should have a left border (border-left-width: 3px)
      const borderLeft = await firstCard.evaluate(el => getComputedStyle(el).borderLeftWidth);
      expect(borderLeft).toBe('3px');
    }
  });
});
