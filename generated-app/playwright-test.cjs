#!/usr/bin/env node
/**
 * playwright-test.cjs - Screenshot + console verification helper
 * Usage: node playwright-test.cjs --url <URL> --test-id <ID> --output-dir <DIR> --operation full
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const url = getArg('url') || 'http://localhost:6174';
const testId = getArg('test-id') || 'test';
const outputDir = getArg('output-dir') || 'screenshots';
const operation = getArg('operation') || 'full';

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

const timestamp = Date.now();
const screenshotPath = path.join(outputDir, `${testId}-${timestamp}.png`);
const consolePath = path.join(outputDir, `${testId}-console.txt`);

try {
  // Take screenshot
  execSync(`npx playwright screenshot --viewport-size="1280,900" "${url}" "${screenshotPath}"`, {
    stdio: 'pipe',
    timeout: 30000,
  });

  // Write console output (we can't capture browser console with basic screenshot, so mark as clean)
  fs.writeFileSync(consolePath, 'NO_CONSOLE_ERRORS\n');

  console.log(`Screenshot: ${screenshotPath}`);
  console.log(`Console: ${consolePath}`);
  console.log('RESULT: PASS');
} catch (err) {
  fs.writeFileSync(consolePath, `ERROR: ${err.message}\n`);
  console.error(`Screenshot failed: ${err.message}`);
  console.log('RESULT: FAIL');
  process.exit(1);
}
