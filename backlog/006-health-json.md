# Add static /health.json to built output

Add a static health endpoint file to the status page build output:
`dist/health.json` containing exactly `{"ok": true}`.

## Requirements
- Add a static source file `health.json` with content `{"ok": true}` inside
  the status-page source tree.
- `build.mjs` copies it into `dist/` as `dist/health.json` (no templating,
  byte-for-byte copy).
- Extend the existing test file with tests covering: file exists in dist,
  parses as valid JSON, and `ok === true`.
- No new dependencies (Node built-ins only); stay inside
  generated-app/status-page/.

## Acceptance criteria
- `node --test test/build.test.mjs` passes with the new tests included.
- After running the build, `dist/health.json` exists, parses as JSON, and
  equals `{"ok": true}`.
- Existing build outputs (HTML, build-info.json) unchanged in behavior; all
  prior tests still pass.
- No files outside generated-app/status-page/ modified.
