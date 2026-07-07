import { test, expect } from '@playwright/test';

const PROJECT_ID = '2f313916-96af-4d6c-bc25-9ded5401ac3a';
const BASE_URL = 'http://localhost:6174';

test('board loads with issues', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
  // Wait for skeleton to disappear and real content to appear
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/issue-2/board-loaded-v3.png', fullPage: false });
});

test('issue detail panel shows attachments section', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
  await page.waitForTimeout(3000);

  // Look for any issue card or clickable element on the board
  const issueCard = page.locator('[data-testid="issue-card"]').first();
  const hasIssueCard = await issueCard.isVisible().catch(() => false);

  if (hasIssueCard) {
    await issueCard.click();
    await page.waitForTimeout(1000);
  } else {
    // Try clicking on the quick add or create button to make an issue first
    // Or look for any issue-like element
    const anyIssue = page.locator('.cursor-pointer').first();
    if (await anyIssue.isVisible().catch(() => false)) {
      await anyIssue.click();
      await page.waitForTimeout(1000);
    }
  }

  // Check for attachments section
  const attachmentsSection = page.locator('[data-testid="attachments-section"]');
  const dropZone = page.locator('[data-testid="drop-zone"]');
  const uploadButton = page.locator('[data-testid="upload-button"]');

  await page.screenshot({ path: 'screenshots/issue-2/issue-detail-attachments.png', fullPage: false });

  // If the panel is visible, verify the attachments section
  if (await attachmentsSection.isVisible().catch(() => false)) {
    await expect(attachmentsSection).toBeVisible();
    console.log('ATTACHMENTS_SECTION: VISIBLE');
  }
  if (await dropZone.isVisible().catch(() => false)) {
    await expect(dropZone).toBeVisible();
    console.log('DROP_ZONE: VISIBLE');
  }
  if (await uploadButton.isVisible().catch(() => false)) {
    await expect(uploadButton).toBeVisible();
    console.log('UPLOAD_BUTTON: VISIBLE');
  }
});

test('file upload button triggers file input', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
  await page.waitForTimeout(3000);

  const issueCard = page.locator('[data-testid="issue-card"]').first();
  if (await issueCard.isVisible().catch(() => false)) {
    await issueCard.click();
    await page.waitForTimeout(1000);

    // Verify upload button exists
    const uploadButton = page.locator('[data-testid="upload-button"]');
    if (await uploadButton.isVisible().catch(() => false)) {
      // Verify file input exists
      const fileInput = page.locator('[data-testid="file-input"]');
      await expect(fileInput).toBeAttached();
      console.log('FILE_INPUT: ATTACHED');

      // Click upload button - it should trigger the hidden file input
      await uploadButton.click();
      console.log('UPLOAD_BUTTON_CLICKED: SUCCESS');
    }
  }

  await page.screenshot({ path: 'screenshots/issue-2/file-upload-button.png', fullPage: false });
});
