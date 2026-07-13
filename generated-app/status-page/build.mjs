import { mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

export function build() {
  // Clean and create dist/
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true, force: true });
  }
  mkdirSync(DIST, { recursive: true });

  // Copy src/ to dist/
  cpSync(SRC, DIST, { recursive: true });

  // Replace __BUILD_TIME_UTC__ with current UTC ISO 8601 timestamp
  const buildTime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const version = process.env.STATUS_PAGE_VERSION || 'dev';

  function replaceInDir(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        replaceInDir(full);
      } else if (stat.isFile()) {
        const content = readFileSync(full, 'utf8');
        if (content.includes('__BUILD_TIME_UTC__') || content.includes('__STATUS_PAGE_VERSION__')) {
          writeFileSync(
            full,
            content
              .replaceAll('__BUILD_TIME_UTC__', buildTime)
              .replaceAll('__STATUS_PAGE_VERSION__', version),
            'utf8'
          );
        }
      }
    }
  }

  replaceInDir(DIST);

  // Emit machine-readable build info with the same timestamp baked into the HTML
  writeFileSync(
    join(DIST, 'build-info.json'),
    JSON.stringify({ builtAt: buildTime, page: 'status', version }) + '\n',
    'utf8'
  );

  return buildTime;
}

// Run when executed directly
const buildTime = build();
console.log(`Build complete → dist/ (timestamp: ${buildTime})`);
