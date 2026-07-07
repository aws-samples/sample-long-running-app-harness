const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:6174/project/2f313916-96af-4d6c-bc25-9ded5401ac3a/board');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const bell = await page.locator('[data-testid="priority-alert-bell"]');
  if (await bell.count() > 0) {
    await bell.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: 'screenshots/issue-5/bell-dropdown-open.png' });
  await browser.close();
  console.log('Screenshot saved');
})();
