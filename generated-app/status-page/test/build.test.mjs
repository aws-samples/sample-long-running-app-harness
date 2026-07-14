import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../build.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');

describe('status-page build', () => {
  before(() => {
    // Clean dist/ before running
    if (existsSync(DIST)) {
      rmSync(DIST, { recursive: true, force: true });
    }
    build();
  });

  it('produces dist/index.html', () => {
    assert.ok(existsSync(join(DIST, 'index.html')), 'dist/index.html must exist');
  });

  it('produces dist/style.css', () => {
    assert.ok(existsSync(join(DIST, 'style.css')), 'dist/style.css must exist');
  });

  it('index.html contains the page title "Status"', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    assert.ok(html.includes('<title>Status</title>'), 'page title must be "Status"');
  });

  it('index.html contains "all systems go"', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    assert.ok(html.includes('all systems go'), 'must contain "all systems go" text');
  });

  it('baked build time is valid ISO 8601 UTC (no placeholder remaining)', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    // No placeholder should remain
    assert.ok(!html.includes('__BUILD_TIME_UTC__'), 'placeholder must be replaced');
    // Timestamp must match ISO 8601 UTC pattern
    const isoPattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/;
    assert.ok(isoPattern.test(html), 'must contain valid ISO 8601 UTC timestamp');
  });

  it('two builds produce different timestamps', async () => {
    const html1 = readFileSync(join(DIST, 'index.html'), 'utf8');
    const isoPattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/;
    const time1 = html1.match(isoPattern)[0];

    // Wait a moment and rebuild
    await new Promise(r => setTimeout(r, 1100));
    build();

    const html2 = readFileSync(join(DIST, 'index.html'), 'utf8');
    const time2 = html2.match(isoPattern)[0];

    assert.notEqual(time1, time2, 'build times must differ between consecutive builds');
  });

  it('no external URLs in HTML output', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    // Allow same-origin relative links but no absolute external URLs
    const externalPattern = /https?:\/\/(?!localhost|127\.0\.0\.1)/gi;
    const matches = html.match(externalPattern);
    assert.equal(matches, null, `HTML must not reference external URLs, found: ${matches}`);
  });

  it('no external URLs in CSS output', () => {
    const css = readFileSync(join(DIST, 'style.css'), 'utf8');
    const externalPattern = /https?:\/\/(?!localhost|127\.0\.0\.1)/gi;
    const matches = css.match(externalPattern);
    assert.equal(matches, null, `CSS must not reference external URLs, found: ${matches}`);
  });

  it('all referenced assets in HTML exist in dist/', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    // Match href="..." and src="..." (excluding absolute URLs)
    const refPattern = /(?:href|src)="([^"]+)"/g;
    let match;
    while ((match = refPattern.exec(html)) !== null) {
      const ref = match[1];
      // Skip absolute URLs and anchors
      if (ref.startsWith('http') || ref.startsWith('#') || ref.startsWith('//')) continue;
      const assetPath = join(DIST, ref);
      assert.ok(existsSync(assetPath), `Referenced asset "${ref}" must exist in dist/`);
    }
  });

  it('produces dist/health.json', () => {
    assert.ok(existsSync(join(DIST, 'health.json')), 'dist/health.json must exist');
  });

  it('dist/health.json parses as valid JSON', () => {
    const content = readFileSync(join(DIST, 'health.json'), 'utf8');
    assert.doesNotThrow(() => JSON.parse(content), 'health.json must be valid JSON');
  });

  it('dist/health.json has ok === true', () => {
    const content = readFileSync(join(DIST, 'health.json'), 'utf8');
    const data = JSON.parse(content);
    assert.strictEqual(data.ok, true, 'health.json must have ok === true');
  });
});
