# 001 — Stand up CI pipeline (test + preview deploy)

Create the CI foundation before any feature work.

## Work
- Add `.github/workflows/status-page-test.yml`: triggers on PRs/pushes touching `status-page/**`; runs `node status-page/build.mjs` and `node --test status-page/test/` (add a trivial placeholder build script and passing smoke test so the pipeline is green from day one).
- Add `.github/workflows/status-page-preview.yml`: triggers on PRs touching `status-page/**`; builds, then syncs `status-page/dist/` to the repo's existing S3/CloudFront preview location. Inspect the host repo's existing workflows to reuse its AWS auth (OIDC role or secrets) and bucket/path conventions; include CloudFront invalidation if the repo's pattern does.
- Keep everything except the workflow files inside `status-page/`. Gitignore `status-page/dist/`.

## Acceptance criteria
- A PR touching `status-page/**` triggers both workflows; neither triggers on unrelated changes.
- Test workflow passes: build script runs and `node --test` reports at least one passing test, using no npm dependencies.
- Preview workflow completes and the deployed preview URL serves the built `index.html` over HTTP 200.
- `status-page/dist/` is not committed to git.
