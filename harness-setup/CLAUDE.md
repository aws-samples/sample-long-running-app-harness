# Agent Harness Setup

This file guides Claude Code through connecting this repository to an autonomous coding agent powered by AWS Bedrock AgentCore.

**When to activate**: If the user's first message is a greeting, "help", "setup", "harness", or doesn't specify a concrete task — run this setup flow. If the user comes with a specific task, skip this and work normally.

## Prerequisites

Before starting, the user must have deployed the agent harness infrastructure. Ask them to confirm:

1. **Harness repo deployed** — The harness repo has been cloned, `make deploy-infra` has been run, and the Docker image has been pushed to ECR
2. **AgentCore runtime exists** — `make get-runtime` shows `"status": "READY"`
3. **GitHub PAT** — A personal access token with `repo` scope that can access THIS repository, stored in AWS Secrets Manager

If any of these aren't done, point them to the harness repo's README for initial setup.

Collect these values from the user (they come from the harness deployment):

| Setting | How to find it |
|---------|---------------|
| Harness repo | The GitHub repo where the harness code lives (e.g., `org/agent-harness`) |
| AgentCore runtime ID | From `make get-runtime` in the harness repo |
| AgentCore role ARN | From `make show-config` in the harness repo (EXECUTION_ROLE_ARN) |
| AWS region | Typically `us-east-1` |
| ECR URI | From `make show-config` in the harness repo |

## Setup Flow

### Step 1: Scan This Repository

Automatically detect as much as possible about this project:

```bash
# Package manager and language
ls package.json Cargo.toml go.mod pyproject.toml Makefile requirements.txt 2>/dev/null

# Lock files → package manager
ls package-lock.json yarn.lock pnpm-lock.yaml bun.lockb Cargo.lock go.sum 2>/dev/null

# Test frameworks
ls vitest.config.* jest.config.* playwright.config.* pytest.ini pyproject.toml .mocharc.* 2>/dev/null

# Build tool configs
ls vite.config.* webpack.config.* next.config.* tsconfig.json esbuild.* rollup.config.* 2>/dev/null

# CI/CD workflows
ls .github/workflows/*.yml 2>/dev/null

# Environment config
ls .env.example .env.template .env.sample 2>/dev/null

# Infrastructure
ls cdk.json terraform/ cloudformation/ infrastructure/ 2>/dev/null

# Test directories
ls -d test/ tests/ __tests__/ spec/ e2e/ cypress/ 2>/dev/null
```

Present the findings to the user in a summary table.

### Step 2: Ask About What Can't Be Auto-Detected

Ask the user about these topics (skip any that were fully detected):

1. **Build & run**: "How do you build and start this project locally? Any prerequisites beyond `npm install`?"
2. **Testing**: "What test commands do you run? Any categories (unit, integration, e2e)?"
3. **Authentication**: "Does this project require auth for testing? Test users, API keys, tokens?"
4. **External dependencies**: "Any external services needed (databases, APIs, message queues)? Which ones can be mocked?"
5. **Verification**: "How would you verify a change works? Browser screenshots? API calls? CLI output?"
6. **CI/CD**: "Do you have existing CI/CD workflows? Should the agent use them or the harness's built-in deploy?"

### Step 3: Generate `.harness/PROJECT_HARNESS.md`

Read the template from the harness repo (if available locally) or use the built-in knowledge of the template structure. Generate `.harness/PROJECT_HARNESS.md` filling in all sections from the scan results and user answers.

```bash
mkdir -p .harness
```

Write the file and show it to the user for review. Iterate until they approve.

### Step 4: Add the Trigger Workflow

Generate `.github/workflows/agent-trigger.yml` using the values collected in Prerequisites.

The workflow should:
- Trigger when an issue receives a rocket reaction from an authorized user
- Call the harness repo's Agent Builder workflow via `workflow_dispatch`
- Pass the issue number and this repo's name as inputs

```bash
mkdir -p .github/workflows
```

Write the workflow file. The user will need to add these GitHub secrets to this repo:

| Secret | Description |
|--------|-------------|
| `HARNESS_REPO_TOKEN` | GitHub PAT that can trigger workflows on the harness repo |

And these repository variables:

| Variable | Description |
|----------|-------------|
| `HARNESS_REPO` | The harness repo (e.g., `org/agent-harness`) |
| `AUTHORIZED_APPROVERS` | Comma-separated GitHub usernames who can approve issues |

### Step 5: Configure the Harness

Tell the user to run these commands in the **harness repo** to register this project:

```bash
# Update the runtime to point at this repo
make update-runtime-env \
  PROJECT_NAME={project-name} \
  WORK_DIR=. \
  BASE_BRANCH={default-branch}

# Rebuild Docker image (to include any harness-specific prompts)
# Only needed if adding project-specific prompts to the harness
docker build --platform linux/arm64 -t <ECR_URI>:latest .
docker push <ECR_URI>:latest
```

### Step 6: Test the Integration

Walk the user through a test run:

1. Commit and push the `.harness/` directory and workflow file
2. Create a test issue:
   ```bash
   gh issue create --title "[Test] Agent harness verification" \
     --body "This is a test issue to verify the agent harness is working. Make a small, safe change (add a comment to a file, update a version number, etc.) and commit it."
   ```
3. Add a rocket reaction to the issue
4. Watch for the agent to pick it up:
   ```bash
   # Check if the workflow triggered on the harness repo
   gh run list --repo {harness-repo} --workflow "Agent Builder" --limit 3
   ```
5. Verify the agent creates a branch and pushes changes

### Step 7: Summary

Once everything is working, show a summary:

```
Agent harness connected successfully!

Repository: {this-repo}
Harness: {harness-repo}
Working directory: . (repo root)
Branch strategy: agent-runtime

To trigger the agent:
  1. Create an issue describing the work
  2. Add a rocket reaction
  3. The agent will pick it up within 5 minutes

To monitor:
  gh run list --repo {harness-repo} --workflow "Agent Builder" --limit 3

Files added:
  .harness/PROJECT_HARNESS.md  — Project configuration for the agent
  .github/workflows/agent-trigger.yml — Triggers agent on issue approval
```
