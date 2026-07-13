# Verify — issue #15 (task 005, version footer), attempt 1 — PASS

Verifier session on 2026-07-13 (branch `delivery-agent-tier3`, task commit
`37bd969`). Issue #15 corresponds to `backlog/005-footer-version.md`.

## Per-criterion results

1. **`node --test test/build.test.mjs` passes including the new tests** —
   **PASS.** Executed directly: 15/15 pass (12 existing + 3 new: footer
   default "dev", version in build-info.json, env var override). Unlike the
   issue #14 verify attempt, this session's permissions allowed running node,
   so execution evidence exists.

2. **`STATUS_PAGE_VERSION=1.2.3` build produces correct artifacts** —
   **PASS.** Ran the criterion command verbatim; `dist/index.html` contains
   `<footer>version: 1.2.3</footer>` and `dist/build-info.json` is
   `{"builtAt":"...","page":"status","version":"1.2.3"}`.

3. **No files outside `generated-app/status-page/`** — **PASS.**
   `git diff --name-only 40c20f9..37bd969` shows exactly build.mjs,
   src/index.html, test/build.test.mjs — all under the scoped dir.

## Test-depth review

New tests are genuinely E2E (run real `build()`, assert on real dist/
output, exact-string footer assertion, env-var test restores state in
`finally`). Exact-keys assertion on build-info.json extended to include
`version`.

## Notes

- No CI workflow runs these tests on `delivery-agent-tier3` (still true from
  the #14 verify: `status-page-deploy-fix.yml` only watches `agent-runtime`).
  Direct execution remains the only evidence path.
- Created the `verified` label (didn't exist); applied it and removed
  `agent-building`. Verdict comment:
  https://github.com/aws-samples/sample-long-running-app-harness/issues/15#issuecomment-4963007527
