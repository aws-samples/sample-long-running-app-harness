<!-- PROJECT_HARNESS_TEMPLATE.md
     Claude reads this template when helping users harness an existing project.
     Unlike BUILD_PLAN_TEMPLATE.md (which describes an app to build from scratch),
     this template describes how to WORK WITH an existing codebase — how to build,
     test, authenticate, and verify changes.

     Sections marked [AUTO-DETECTABLE] can be inferred by scanning the repo.
     Sections marked [MANUAL] require user input. -->

<project_harness>
  <repository>
    <!-- [AUTO-DETECTABLE] Repository metadata.
         Claude can detect: URL (from git remote), default branch, existing branches.
         User should confirm branch strategy (e.g., feature branches off main). -->

    <url><!-- e.g., https://github.com/org/repo --></url>
    <default_branch><!-- e.g., main --></default_branch>
    <branch_strategy>
      <!-- How should the agent create branches?
           Options:
           - "feature-branch": agent creates feature/issue-N branches off default_branch
           - "direct": agent commits directly to a working branch (e.g., agent-runtime)
           Default: "direct" (agent-runtime branch, same as greenfield mode) -->
    </branch_strategy>
  </repository>

  <working_directory>
    <!-- [AUTO-DETECTABLE] Where does the project code live relative to the repo root?

         HARNESS STATUS: Supported via WORK_DIR env var.
         - WORK_DIR=generated-app (default) — agent works in generated-app/ subdirectory
         - WORK_DIR=. — agent works at repo root (for existing projects)
         - WORK_DIR=packages/app — agent works in a monorepo subdirectory

         Examples:
         - "." for a standard repo where code is at root
         - "packages/frontend" for a monorepo subdirectory
         - "src" if the main application code is in src/ -->

    <path><!-- e.g., "." or "packages/app" --></path>
  </working_directory>

  <build_system>
    <!-- [AUTO-DETECTABLE] Build tooling and commands.
         Claude can detect: package manager (from lock files), scripts (from package.json),
         build tool (from config files like vite.config.ts, webpack.config.js, etc.),
         language (from file extensions and config). -->

    <package_manager><!-- npm | yarn | pnpm | bun | cargo | go | pip --></package_manager>
    <install_command><!-- e.g., "npm install" --></install_command>
    <build_command><!-- e.g., "npm run build" --></build_command>
    <dev_command><!-- e.g., "npm run dev" (for starting dev server) --></dev_command>
    <output_directory><!-- e.g., "dist/" or "build/" --></output_directory>

    <prerequisites>
      <!-- [MANUAL] Anything the agent needs before it can build.
           Examples:
           - "Run `npx prisma generate` before build"
           - "Requires Docker for local DynamoDB"
           - "Needs wasm-pack installed for Rust components"

           HARNESS STATUS: The agent container has Node.js 20, npm, Python 3.11,
           AWS CLI, CDK, and common tools. Anything else must be installed via
           the build system or noted here as a limitation. -->
    </prerequisites>
  </build_system>

  <testing>
    <!-- Testing configuration — what frameworks exist, how to run them,
         and what categories of tests the project has. -->

    <platform>
      <!-- [AUTO-DETECTABLE] What kind of application is this?
           Options: web | api | cli | library | mobile | mixed
           This determines which verification strategy the agent uses. -->
    </platform>

    <frameworks>
      <!-- [AUTO-DETECTABLE] List testing frameworks and their configs.
           Examples:
           - "vitest (vitest.config.ts) — unit + integration tests"
           - "jest (jest.config.js) — unit tests"
           - "playwright (playwright.config.ts) — e2e tests"
           - "pytest (pyproject.toml) — backend tests"
           - "cargo test — Rust unit tests" -->
    </frameworks>

    <commands>
      <!-- [AUTO-DETECTABLE from package.json scripts or Makefile targets]
           List the commands to run each test category:
           - unit: "npm test" or "vitest run"
           - integration: "npm run test:integration"
           - e2e: "npx playwright test"
           - infrastructure: "cd infrastructure && npm test"
           - all: "npm run test:all" -->
    </commands>

    <categories>
      <!-- [MANUAL] Define test categories and approximate counts.
           The agent uses this to structure its test writing.

           Example:
           - shared: ~5 (schema validation, type exports)
           - infrastructure: ~8 (CDK assertions, resource counts)
           - backend: ~10 (API handler logic, database operations)
           - frontend: ~30 (component rendering, user interactions)
           - e2e: ~5 (full user workflows) -->
    </categories>
  </testing>

  <authentication>
    <!-- [MANUAL] How to authenticate for testing. This is always manual because
         it involves credentials the agent cannot discover.

         HARNESS STATUS: The agent can read secrets from AWS Secrets Manager
         (path: claude-code/{env}/*). Any test credentials should be stored there
         or provided via environment variables.

         IMPORTANT: Never put real credentials in this file. Reference secret
         names or env var names instead. -->

    <test_users>
      <!-- Example:
           - Admin: stored in Secrets Manager at claude-code/reinvent/test-admin-creds
           - Regular user: stored at claude-code/reinvent/test-user-creds
           - Or: "No authentication required — app uses anonymous access" -->
    </test_users>

    <api_keys>
      <!-- External API keys needed for testing.
           Example:
           - Stripe test key: env var STRIPE_TEST_KEY (from Secrets Manager)
           - "None — all external APIs are mocked in tests" -->
    </api_keys>

    <setup_steps>
      <!-- Manual steps to set up auth for testing.
           Example:
           1. Create test user: `aws cognito-idp admin-create-user ...`
           2. Set password: `aws cognito-idp admin-set-user-password ...`
           3. Get token: `curl -X POST /auth/login -d '{"user":"test"}'`
           Or: "No setup needed — tests use mocked auth" -->
    </setup_steps>
  </authentication>

  <environment>
    <!-- Environment configuration the agent needs. -->

    <env_vars>
      <!-- [MANUAL] Required environment variables.
           List each with: name, description, source (hardcoded/secrets-manager/ssm/derived).

           Example:
           - DATABASE_URL: DynamoDB endpoint (derived from CDK deploy output)
           - VITE_API_URL: API Gateway URL (read from SSM /claude-code/infra/deploy-state)
           - NODE_ENV: "test" (hardcoded for test runs) -->
    </env_vars>

    <external_dependencies>
      <!-- [MANUAL] External services the project depends on.
           Example:
           - DynamoDB: provisioned by CDK stack
           - Redis: not available in agent container (must mock)
           - S3: available via agent IAM role (scoped to project prefix)
           - PostgreSQL: not supported — must use DynamoDB or mock -->
    </external_dependencies>

    <database_setup>
      <!-- [MANUAL] How to initialize the database for testing.
           Example:
           - "Run `npx prisma db push` to sync schema"
           - "DynamoDB tables created by CDK — no manual setup"
           - "Run `npm run seed` to populate test data"
           - "Tables auto-created on first request via on-demand mode" -->
    </database_setup>
  </environment>

  <ci_cd>
    <!-- CI/CD integration — how the agent's changes get built and deployed. -->

    <existing_workflows>
      <!-- [AUTO-DETECTABLE from .github/workflows/]
           List existing CI/CD workflows and what they do.
           Example:
           - ci.yml: runs tests on PR (triggered by push to any branch)
           - deploy.yml: deploys to staging on merge to main
           - release.yml: deploys to production on tag -->
    </existing_workflows>

    <agent_ci_strategy>
      <!-- [MANUAL] How should agent changes integrate with CI/CD?

           HARNESS STATUS: The harness provides two built-in workflows:
           - deploy-preview.yml: builds frontend, deploys to S3+CloudFront (triggered by push to agent-runtime)
           - deploy-infrastructure.yml: runs cdk deploy (triggered by push to agent-runtime with infra changes)

           Options:
           - "use-harness-workflows": use the built-in deploy-preview + deploy-infrastructure workflows
           - "use-existing": agent pushes to a branch, existing CI runs
           - "hybrid": use harness for preview, existing CI for backend
           - "none": no CI/CD — agent builds and tests locally only -->
    </agent_ci_strategy>
  </ci_cd>

  <verification>
    <!-- How the agent verifies its work. This maps to the test verification
         system in the harness (screenshots for web, backend-verify.cjs for API/CLI). -->

    <web_verification>
      <!-- [AUTO-DETECTABLE based on platform]
           For web applications — uses Playwright screenshots.

           HARNESS STATUS: Fully supported. The agent uses:
           - playwright-test.cjs for screenshots + console capture
           - Screenshots are uploaded to S3 and linked in GitHub comments
           - Console errors are checked automatically

           Configuration:
           - base_url: "http://localhost:6174" (default) or custom
           - wait_for: selector or network idle strategy
           - viewport: default 1280x720 -->
    </web_verification>

    <backend_verification>
      <!-- [AUTO-DETECTABLE based on platform]
           For API/CLI/library projects — uses backend-verify.cjs.

           HARNESS STATUS: Fully supported. The agent uses:
           - backend-verify.cjs runs shell commands and captures output
           - Produces -result.txt with VERIFIED_BY sentinel
           - Supports: curl commands, AWS CLI, database queries, script execution

           Configuration:
           - api_base_url: "http://localhost:4001" (default) or custom
           - commands: shell commands the agent can run for verification -->
    </backend_verification>

    <custom_verification>
      <!-- [MANUAL] Project-specific verification beyond web/backend defaults.
           Example:
           - "Run `npm run validate` to check generated schemas"
           - "Check CloudWatch metrics after Lambda invocation"
           - "Verify S3 objects exist after file upload test" -->
    </custom_verification>
  </verification>
</project_harness>
