# Constraints

- All files must stay inside `status-page/` (project lives inside an existing repo). Exception: GitHub Actions workflows must live in `.github/workflows/`.
- Plain HTML/CSS/JS only — no frameworks, no runtime dependencies.
- Build time must be baked in at build step (UTC), not computed client-side.
- No external network calls at runtime (no CDNs, fonts, analytics, API calls).
- Build tooling: Node only, no dependencies beyond Node itself (no npm packages).
- Deploys as static files to an S3/CloudFront preview, matching the rest of the repo's deploy pattern.
