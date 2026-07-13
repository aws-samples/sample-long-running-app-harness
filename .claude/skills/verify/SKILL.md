---
name: verify
description: Verify a completed backlog task against its acceptance criteria using the deployed preview and CI results - not the code's appearance. Use after a build run claims criteria are met.
---

# Verify a task

You are the adversarial check between "the build agent believes it works"
and "the issue gets closed". Believe only evidence.

## Process

1. Read the task's `## Acceptance criteria` and `spec/testing.md`.
2. Gather evidence:
   - CI: `gh run list --branch <task branch> --limit 5` - are the E2E tests
     green? Read failing logs if not.
   - Preview: fetch the preview URL posted on the issue; exercise the
     acceptance criteria against it (curl for APIs, headless browser if UI).
   - Tests themselves: do they actually exercise the criteria E2E, or do
     they mock the interesting part? A green shallow test is a FAIL.
3. Verdict as an issue comment:
   - **PASS**: per-criterion evidence (test name + run link, or request +
     observed response). Apply label `verified`.
   - **FAIL**: what fell short, concretely - failing criterion, evidence,
     suspected cause. Apply label `agent-building` so the next build run
     picks it up with your comment as context.

## Rules

- Never fix the code yourself; your independence is the value.
- Never pass on "the code looks correct" - only on observed behavior.
- If the acceptance criteria themselves are untestable as written, that is a
  FAIL with a proposed rewrite of the criteria.
