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

  it('produces dist/build-info.json', () => {
    assert.ok(existsSync(join(DIST, 'build-info.json')), 'dist/build-info.json must exist');
  });

  it('build-info.json is valid JSON with correct fields', () => {
    const raw = readFileSync(join(DIST, 'build-info.json'), 'utf8');
    const info = JSON.parse(raw);
    assert.equal(info.page, 'status', 'page field must be "status"');
    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
    assert.ok(isoPattern.test(info.builtAt), 'builtAt must be ISO 8601 UTC');
    assert.deepEqual(
      Object.keys(info).sort(),
      ['builtAt', 'page', 'version'],
      'build-info.json must contain exactly builtAt, page and version'
    );
  });

  it('build-info.json builtAt matches the HTML <time> value', () => {
    const info = JSON.parse(readFileSync(join(DIST, 'build-info.json'), 'utf8'));
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    const timeMatch = html.match(/<time>([^<]+)<\/time>/);
    assert.ok(timeMatch, 'index.html must contain a <time> element');
    assert.equal(info.builtAt, timeMatch[1], 'JSON builtAt must equal the HTML baked time');
  });

  it('index.html contains a version footer with default "dev"', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    assert.ok(html.includes('<footer>version: dev</footer>'), 'footer must show default version "dev"');
    assert.ok(!html.includes('__STATUS_PAGE_VERSION__'), 'version placeholder must be replaced');
  });

  it('build-info.json contains the default version "dev"', () => {
    const info = JSON.parse(readFileSync(join(DIST, 'build-info.json'), 'utf8'));
    assert.equal(info.version, 'dev', 'version field must default to "dev"');
  });

  it('STATUS_PAGE_VERSION env var overrides the version', () => {
    process.env.STATUS_PAGE_VERSION = '9.9.9-test';
    try {
      build();
      const html = readFileSync(join(DIST, 'index.html'), 'utf8');
      assert.ok(html.includes('<footer>version: 9.9.9-test</footer>'), 'footer must show overridden version');
      const info = JSON.parse(readFileSync(join(DIST, 'build-info.json'), 'utf8'));
      assert.equal(info.version, '9.9.9-test', 'build-info.json must show overridden version');
    } finally {
      delete process.env.STATUS_PAGE_VERSION;
      build();
    }
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
});
