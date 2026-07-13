# 003 — Automated tests for build output

## Work
- Replace the placeholder smoke test with real tests in `status-page/test/` using Node's built-in test runner (`node --test`), no npm dependencies.
- Tests run the build, then assert on `dist/` output:
  - `index.html` exists and contains the page title and the exact text "all systems go".
  - Baked build time matches ISO 8601 UTC (`/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/`) and no placeholder remains.
  - No external URLs in HTML/CSS/JS output (regex scan for `http://` / `https://` references to third-party hosts) — enforces the no-runtime-network-calls constraint.
  - All referenced assets (e.g., `style.css`) exist in `dist/`.

## Acceptance criteria
- `node --test status-page/test/` passes locally and in the 001 test workflow with zero npm dependencies.
- Deliberately breaking the build (e.g., leaving the placeholder unreplaced or adding an external URL) makes the test suite fail.
- The CI test workflow from task 001 runs these tests on PRs touching `status-page/**` and blocks on failure.
