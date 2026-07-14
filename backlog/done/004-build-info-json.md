# Emit build-info.json alongside the status page

The status page bakes its build time into HTML. Ops wants the same data
machine-readable: the build must also emit `dist/build-info.json`.

## Requirements
- `build.mjs` additionally writes `dist/build-info.json`:
  `{"builtAt": "<same ISO-8601 UTC timestamp baked into the HTML>", "page": "status"}`
- The timestamp in JSON and HTML must be identical for a given build.
- Extend the existing test file with tests covering: file exists, valid JSON,
  fields correct, timestamp matches the HTML's.
- No new dependencies; stay inside generated-app/status-page/.

## Acceptance criteria
- `node --test test/build.test.mjs` passes with the new tests included.
- `dist/build-info.json` parses and its builtAt equals the HTML <time> value.
- No files outside generated-app/status-page/ modified.
