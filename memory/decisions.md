# Decisions

## Plain static stack, no frameworks
User chose plain HTML/CSS/JS for a tiny status dashboard test project. Rationale: minimal footprint, easy to reason about, project is a pipeline test.

## Everything contained in status-page/
Project lives inside an existing repo; all source, build output, and config that can be scoped must stay under `status-page/`. Rationale: avoid polluting the host repo.

## Build time baked in at build step
UTC build timestamp is injected during build, not rendered client-side. Rationale: explicit user requirement; implies a small build step exists.

## Node-only build tooling, zero npm dependencies
Build script uses only Node built-ins (fs, etc.). Rationale: user constraint — no dependencies beyond Node; keeps install step trivial in CI.

## No runtime network calls
Page must be fully self-contained: inline or local CSS/JS, no fonts/CDNs/APIs. Rationale: user constraint; also simplifies E2E verification.

## Deploy target: S3/CloudFront preview
Preview deploys push built static files to S3 behind CloudFront, matching the host repo's existing deploy pattern. Rationale: consistency with the rest of the repo.
