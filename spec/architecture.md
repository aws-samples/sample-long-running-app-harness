# Architecture

## Layout
```
status-page/
  src/
    index.html      # template with __BUILD_TIME_UTC__ placeholder
    style.css       # local styles (green badge)
  build.mjs         # Node-builtins-only build script
  dist/             # build output (gitignored), deployed to S3
  test/             # Node built-in test runner (node --test)
.github/workflows/
  status-page-test.yml     # runs build + tests on PR/push (path-filtered)
  status-page-preview.yml  # builds and syncs dist/ to S3 preview, CloudFront invalidation
```

## Build
`node build.mjs` copies `src/` to `dist/`, replacing `__BUILD_TIME_UTC__` with the current UTC ISO timestamp. No npm dependencies; Node built-ins only.

## Runtime
Fully static, self-contained page: no external network calls, no frameworks. All assets local or inline.

## Deploy
Preview deploys sync `status-page/dist/` to the repo's existing S3/CloudFront preview setup. AWS auth mechanism (OIDC vs secrets) and bucket/path convention to be confirmed from the host repo's existing workflows during task 001.
