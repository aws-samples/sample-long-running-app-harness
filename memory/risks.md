# Risks & unknowns

- CI workflows must live in the repo's `.github/workflows/` (outside `status-page/`); treated as an accepted exception.
- Details of the repo's existing S3/CloudFront preview setup unknown: bucket name/path convention, AWS credentials mechanism in Actions (OIDC role vs secrets), CloudFront invalidation needs.
- Whether an existing shared preview-deploy workflow can be reused vs. writing a new one scoped to `status-page/`.
