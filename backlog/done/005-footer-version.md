# Add version footer to the status page

## Requirements
- `build.mjs` reads an optional `STATUS_PAGE_VERSION` env var (default "dev")
  and bakes it into a new footer: `<footer>version: <value></footer>` in
  dist/index.html, and adds a "version" field to dist/build-info.json.
- Extend test/build.test.mjs: footer present with default, version appears in
  build-info.json, env var override works.
- No new dependencies; only files inside generated-app/status-page/.

## Acceptance criteria
- `node --test test/build.test.mjs` passes including the new tests.
- `STATUS_PAGE_VERSION=1.2.3 node -e "import('./build.mjs').then(m=>m.build())"`
  produces dist/index.html containing "version: 1.2.3" and build-info.json
  with "version": "1.2.3".
- No files outside generated-app/status-page/ modified.
