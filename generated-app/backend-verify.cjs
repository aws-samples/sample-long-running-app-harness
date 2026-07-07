#!/usr/bin/env node
/**
 * backend-verify.cjs - Backend test verification helper
 * Usage: node backend-verify.cjs --test-id <ID> --output-dir <DIR> --command "<CMD>"
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const testId = getArg('test-id') || 'test';
const outputDir = getArg('output-dir') || 'screenshots';
const command = getArg('command') || 'echo "no command"';

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

const resultPath = path.join(outputDir, `${testId}-result.txt`);
const consolePath = path.join(outputDir, `${testId}-console.txt`);

try {
  const output = execSync(command, {
    stdio: 'pipe',
    timeout: 60000,
    encoding: 'utf-8',
  });

  fs.writeFileSync(consolePath, output || 'Command completed successfully\n');
  fs.writeFileSync(resultPath, 'RESULT: PASS\n');
  console.log(`Result: ${resultPath}`);
  console.log(`Console: ${consolePath}`);
  console.log('RESULT: PASS');
} catch (err) {
  const output = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync(consolePath, output || `ERROR: ${err.message}\n`);
  fs.writeFileSync(resultPath, 'RESULT: FAIL\n');
  console.error(`Command failed: ${err.message}`);
  console.log('RESULT: FAIL');
  process.exit(1);
}
