import { test, expect } from '@playwright/test';

test('issue detail panel shows attachments section with upload button', async ({ page }) => {
  await page.goto('http://localhost:6174/project/411e733c-c843-4510-b323-c37614a27ca6/board');
  await page.waitForLoadState('networkidle');

  // Click first issue card to open detail panel
  const firstCard = page.locator('[class*="bg-card-bg rounded-lg p-3"]').first();
  await firstCard.click();

  const panel = page.locator('[class*="animate-slide-in-right"]');
  await expect(panel).toBeVisible({ timeout: 5000 });

  // Verify the attachments section exists
  const attachmentsSection = panel.locator('[data-testid="attachments-section"]');
  await expect(attachmentsSection).toBeVisible({ timeout: 5000 });

  // Verify the upload button exists
  const uploadButton = panel.locator('[data-testid="upload-button"]');
  await expect(uploadButton).toBeVisible();
  await expect(uploadButton).toContainText('Upload');

  // Verify the drop zone exists
  const dropZone = panel.locator('[data-testid="drop-zone"]');
  await expect(dropZone).toBeVisible();

  // Verify empty state message
  await expect(dropZone.getByText('Drop files here or')).toBeVisible();
  await expect(dropZone.getByText('browse')).toBeVisible();

  // Verify hidden file input exists
  const fileInput = panel.locator('[data-testid="file-input"]');
  await expect(fileInput).toBeAttached();

  await page.screenshot({ path: 'screenshots/issue-2/file-upload-section.png', fullPage: false });
});

test('clicking upload button triggers file input', async ({ page }) => {
  await page.goto('http://localhost:6174/project/411e733c-c843-4510-b323-c37614a27ca6/board');
  await page.waitForLoadState('networkidle');

  const firstCard = page.locator('[class*="bg-card-bg rounded-lg p-3"]').first();
  await firstCard.click();

  const panel = page.locator('[class*="animate-slide-in-right"]');
  await expect(panel).toBeVisible({ timeout: 5000 });

  // File input should be hidden
  const fileInput = panel.locator('[data-testid="file-input"]');
  await expect(fileInput).toBeAttached();
  await expect(fileInput).toBeHidden();

  // The upload button should be clickable
  const uploadButton = panel.locator('[data-testid="upload-button"]');
  await expect(uploadButton).toBeVisible();
});
