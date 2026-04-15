# Long-Horizon Coding Agent Demo

An autonomous agent system that builds full-stack applications from GitHub issues using AWS Bedrock AgentCore and the Claude Agent SDK.

> **Important:** This is sample code for demonstration and educational purposes only, and should not be used in production as-is. You should work with your security and legal teams to meet your organizational security, regulatory, and compliance requirements before deploying any solution based on this code. AWS and Anthropic are not responsible for any security issues that may arise from using this sample code.

## Quick Start

### Prerequisites

- AWS account with Bedrock AgentCore access
- GitHub repository with Actions enabled
- Docker installed locally
- AWS CLI and CDK configured
- `agentcore` CLI installed (`pip install bedrock-agentcore`) — **Note**: the `agentcore launch/push/build` subcommands are broken; use `make` targets instead (see below)

### Deployment Steps

```bash
# 0. Copy and fill in your local config
cp Makefile.local.example Makefile.local
# Edit Makefile.local: set AWS_PROFILE, AWS_REGION, VPC_ID, GITHUB_REPO

# 1. Deploy CDK infrastructure (ECR, S3 buckets, CloudFront, IAM roles)
make deploy-infra

# 2. Build and push the Docker image (ECR URI from: make show-config)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ECR_URI>
docker build --platform linux/arm64 -t <ECR_URI>:latest .
docker push <ECR_URI>:latest

# 3. Create the AgentCore runtime (first time only)
make create-runtime
# Copy the agentRuntimeId from the output into Makefile.local as AGENT_RUNTIME_ID
# Then update the runtime environment:
make update-runtime-env
```

### GitHub Setup

1. **Secrets** (Settings > Secrets and variables > Actions > Secrets):

   | Secret | Description |
   |--------|-------------|
   | `AWS_ACCESS_KEY_ID` | IAM user access key for GitHub Actions |
   | `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
   | `AWS_AGENTCORE_ROLE_ARN` | IAM role ARN for invoking AgentCore (output of CDK deploy) |
   | `AWS_PREVIEW_DEPLOY_ROLE_ARN` | IAM role ARN for deploying previews (output of CDK deploy) |
   | `AWS_INFRA_DEPLOY_ROLE_ARN` | IAM role ARN for deploying agent-written CDK infra (output of CDK deploy) |

2. **Variables** (Settings > Secrets and variables > Actions > Variables):

   | Variable | Description |
   |----------|-------------|
   | `AUTHORIZED_APPROVERS` | Comma-separated GitHub usernames who can approve builds |
   | `AWS_REGION` | AWS region where infrastructure is deployed (e.g. `us-east-1`) |
   | `AGENTCORE_AGENT_ID` | AgentCore runtime ID (from `make create-runtime` output) |
   | `APP_CDK_STACK_NAME` | CDK stack name for agent-generated app (e.g. `canopy-app-stack`) |
   | `PREVIEWS_BUCKET_NAME` | S3 bucket for preview deployments (output of CDK deploy) |
   | `PREVIEWS_CDN_DOMAIN` | CloudFront domain for previews (output of CDK deploy) |
   | `PREVIEWS_DISTRIBUTION_ID` | CloudFront distribution ID for cache invalidation (output of CDK deploy) |

3. **Labels** (must exist for workflows):

   ```bash
   gh api repos/OWNER/REPO/labels -f name="agent-building" -f color="FBCA04" -f description="Agent is actively working on this issue"
   gh api repos/OWNER/REPO/labels -f name="agent-complete" -f color="0E8A16" -f description="Agent has completed this issue"
   gh api repos/OWNER/REPO/labels -f name="tests-failed" -f color="D93F0B" -f description="Tests failed during agent build"
   ```

### AWS Secrets Manager

The agent reads secrets at runtime:

| Secret Name | Description |
|-------------|-------------|
| `claude-code/{env}/anthropic-api-key` | Anthropic API key (not needed if using Bedrock) |
| `claude-code/{env}/github-token` | Default GitHub PAT (fallback) |
| `claude-code/{env}/github-token-{org}` | Org-specific GitHub PAT (optional) |

Where `{env}` is the environment name (default: `reinvent`).

## How It Works

1. **User creates a GitHub issue** with a feature request
2. **Users vote** with reactions to prioritize what gets built
3. **Authorized user approves** by adding a reaction
4. **Issue poller** (runs every 5 min) detects approved issues, sorted by votes
5. **Agent builder** workflow acquires lock and invokes AWS Bedrock AgentCore
6. **Bedrock entrypoint** clones the repo and starts the Claude agent
7. **Agent builds the feature** following the build plan, taking screenshots, running tests
8. **Progress is tracked** via commits pushed to the `agent-runtime` branch
9. **On completion**, the `agent-complete` label is added
10. **Deploy preview** workflow builds and deploys to CloudFront

## Creating a New Project

> **Recommended**: Run `claude` in this repo for an interactive guided setup. Claude will check your prerequisites, help you create a BUILD_PLAN.md, deploy infrastructure, and trigger the agent — all conversationally.

The agent uses `PROJECT_NAME` to find build plans and configure each project. To build something other than the default Canopy app:

### 1. Create a build plan directory

```
prompts/
  myapp/
    BUILD_PLAN.md         # Required: full project specification
    EXAMPLE_TEST.txt      # Optional: example test for the agent to follow
    DEBUGGING_GUIDE.md    # Optional: project-specific debugging tips
```

### 2. Write BUILD_PLAN.md

This is the most important file. It tells the agent exactly what to build. Include:

- **Project overview** — what the app does, who it's for
- **Technology stack** — framework, build tools, styling, backend
- **API specification** — endpoints, request/response schemas
- **Data models** — entities, relationships, database design
- **UI specification** — pages, components, layout
- **Test requirements** — what tests to write, how to run them

See `prompts/canopy/BUILD_PLAN.md` for a complete example.

### 3. Launch with your project name

```bash
# Via make
make launch PROJECT_NAME=myapp

# Or override just the variable
make launch-local PROJECT_NAME=myapp
```

### What PROJECT_NAME controls

- `prompts/{PROJECT_NAME}/BUILD_PLAN.md` is loaded as the build plan
- `prompts/{PROJECT_NAME}/EXAMPLE_TEST.txt` is loaded as test guidance
- `prompts/{PROJECT_NAME}/DEBUGGING_GUIDE.md` is loaded for debugging context
- Shared prompts in `prompts/system_prompt.txt` and `prompts/DEBUGGING_GUIDE.md` are always loaded

## Resetting the Agent

To wipe all agent state and start fresh:

```bash
make reset
```

This performs the following:

1. **Deletes the `agent-runtime` branch** (local and remote) — removes all generated code
2. **Closes all open issues** with the `agent-building` label
3. **Clears SSM parameters** — `/claude-code/current-issue`, `/claude-code/session-id`, `/claude-code/infra/deploy-state`
4. **Empties S3 buckets** — screenshots and previews
5. **Invalidates CloudFront caches** — ensures stale content is purged

After reset, create a new GitHub issue and add a reaction to trigger a fresh build.

## Configuration

Override any variable on the command line:

```bash
make launch PROJECT_NAME=myapp SESSION_DURATION_HOURS=2.0 DEFAULT_MODEL=us.anthropic.claude-opus-4-6-v1
```

Key variables (set in `Makefile` or via environment):

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_NAME` | `canopy` | Which build plan to use (`prompts/{name}/`) |
| `DEFAULT_MODEL` | `us.anthropic.claude-opus-4-6-v1` | Bedrock model ID |
| `SESSION_DURATION_HOURS` | `7.0` | Max agent session length |
| `PUSH_INTERVAL_SECONDS` | `300` | How often to push commits |
| `SCREENSHOT_INTERVAL_SECONDS` | `300` | How often to capture screenshots |
| `AWS_PROFILE` | `default` | AWS CLI profile |
| `AWS_REGION` | `us-east-1` | AWS region |
| `GITHUB_REPO` | _(set in Makefile.local)_ | Target GitHub repo (owner/repo) |

Run `make show-config` to see all current values.

## Project Structure

```
├── bedrock_entrypoint.py           # Main orchestrator — clones repo, starts agent
├── claude_code.py                  # Agent session manager (Claude SDK wrapper)
├── src/
│   ├── cloudwatch_metrics.py       # Heartbeat and metrics
│   ├── github_integration.py       # GitHub API operations
│   └── git_operations.py           # Git commit/push logic
├── prompts/
│   ├── system_prompt.txt           # Shared system prompt (all projects)
│   ├── DEBUGGING_GUIDE.md          # Shared debugging tips
│   ├── FRONTEND_AESTHETICS_GUIDE.md # UI design guidance
│   └── canopy/                     # Canopy project build plan
│       ├── BUILD_PLAN.md
│       ├── EXAMPLE_TEST.txt
│       ├── DEBUGGING_GUIDE.md
│       └── system_prompt.txt
├── frontend-scaffold-template/     # React + Vite + Tailwind scaffold
├── infrastructure/                 # CDK stack (ECR, S3, CloudFront, IAM)
├── .github/workflows/
│   ├── issue-poller.yml            # Polls for approved issues
│   ├── agent-builder.yml           # Invokes AgentCore
│   └── deploy-preview.yml          # Deploys built app to CloudFront
└── Makefile                        # All management commands
```

## Production Hardening

This sample code prioritizes clarity and ease of deployment. Before using it in a production environment, consider the following security and operational improvements:

### Networking
- **VPC Flow Logs** — Enable VPC Flow Logs for network traffic auditing (AwsSolutions-VPC7)

### Secrets Management
- **Secret rotation** — Configure automatic rotation for Secrets Manager secrets. External API keys (e.g., Anthropic) require a custom rotation Lambda (AwsSolutions-SMG4)

### S3 Buckets
- **Server access logging** — Enable access logging on the screenshots and previews buckets for audit trails (AwsSolutions-S1)

### CloudFront Distributions
- **WAF integration** — Attach AWS WAF to CloudFront distributions for request filtering and rate limiting (AwsSolutions-CFR2)
- **Access logging** — Enable CloudFront access logging for request-level auditing (AwsSolutions-CFR3)
- **TLS 1.2 minimum** — Enforce TLSv1.2 minimum for viewer connections by configuring a custom ACM certificate with a `SecurityPolicyProtocol.TLS_V1_2_2021` minimum protocol version (AwsSolutions-CFR4)

### IAM
- **Scope down the infra deploy role** — The `GitHubInfraDeployRole` uses broad service-level wildcards (`lambda:*`, `s3:*`, etc.) to support dynamic CDK-generated resource names. For production, scope these to specific resource ARN patterns matching your application (AwsSolutions-IAM5 findings 23-31)

## License

Apache 2.0
