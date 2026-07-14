# 002 — Build the status page and build script

## Work
- `status-page/src/index.html`: page title ("Status"), a green "all systems go" badge, and a build-time element containing the placeholder `__BUILD_TIME_UTC__`.
- `status-page/src/style.css`: local styles; badge rendered green. No external fonts or assets.
- `status-page/build.mjs`: Node-builtins-only script that copies `src/` to `dist/` and replaces `__BUILD_TIME_UTC__` with the current UTC time in ISO 8601 (e.g., `2025-01-01T12:00:00Z`).
- No frameworks, no npm packages, no runtime JS network calls.

## Acceptance criteria
- `node status-page/build.mjs` produces `dist/index.html` and `dist/style.css` with the placeholder replaced by a valid ISO 8601 UTC timestamp (ends in `Z`); no `__BUILD_TIME_UTC__` string remains in `dist/`.
- Two builds a second apart produce different baked timestamps (time comes from build, not hardcoded).
- Opening `dist/index.html` shows the title, the baked build time, and a green "all systems go" badge with zero external network requests.
- `package.json`, if present, declares no dependencies; build works with Node alone.
