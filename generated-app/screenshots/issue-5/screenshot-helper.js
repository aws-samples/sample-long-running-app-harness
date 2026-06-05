const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto('http://localhost:6174/project/2f313916-96af-4d6c-bc25-9ded5401ac3a/board');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'screenshots/issue-5/board-with-priority-a1b2c3.png' });

  // Click bell to open dropdown
  const bell = page.locator('[data-testid="priority-alert-bell"]');
  if (await bell.isVisible()) {
    await bell.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/issue-5/priority-dropdown-open-d4e5f6.png' });
  }

  await browser.close();
})();
