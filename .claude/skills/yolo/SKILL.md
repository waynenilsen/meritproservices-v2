---
name: yolo
description: >
  Ship everything from dirty working tree to merged PR in one shot: format, fix,
  stage, check, commit (conventional commits), push, create PR, squash-merge.
  Use this skill whenever the user says "yolo", "ship it", "just merge it",
  "push everything", "land this", "commit and merge", or wants to go from
  uncommitted changes to a merged PR without manual steps. Also trigger when the
  user wants to automate their full commit-to-merge pipeline or says things like
  "get this into main" or "wrap this up".
---

# Yolo

Take a dirty working tree and ship it to a merged PR. No questions, no hand-holding.

## Step 1: Discover Project Tooling

Read `package.json` to find available scripts. Look for keys matching these patterns:
- **Format**: `format`, `prettier`
- **Fix**: `fix:all`, `fix`, `lint:fix`
- **Check**: `check:all`, `check:format`, `check:lint`, `check:types`, `lint`, `typecheck`, `type-check`

Detect the package manager by checking for lockfiles in the project root:
- `bun.lock` or `bun.lockb` → `bun`
- `pnpm-lock.yaml` → `pnpm`
- `yarn.lock` → `yarn`
- Otherwise → `npm`

Use `<pkg-manager> run <script>` for all script invocations.

## Step 2: Format and Fix

Run the formatter first (e.g., `bun run format`), then the auto-fixer if one exists (e.g., `bun run fix:all`). This handles the easy stuff up front so the check loop has less to complain about.

## Step 3: Stage Everything

Run `git add .` to stage all changes. The `.gitignore` is the safety net here.

Before staging, do a quick `git status` scan. If you spot files matching `.env*`, `*.pem`, `*secret*`, `*credential*` that are about to be staged, print a one-line warning like:

> ⚠ Heads up: staging `.env.local` — make sure this is intentional.

But don't stop. This is yolo mode.

## Step 4: Check Loop (max 3 iterations)

Run all available checks in sequence:
1. Format check (e.g., `check:format`)
2. Lint check (e.g., `check:lint` or `lint`)
3. Type check (e.g., `check:types`)

If everything passes, move on.

If something fails:
- **Format failures** → re-run the formatter, re-stage, re-check
- **Lint failures** → re-run the fixer (e.g., `fix:all` or `lint:fix`), re-stage, re-check
- **Type errors** → read the error output, fix the TypeScript issues by editing the source files directly, re-stage, re-check

Cap this at 3 iterations. If checks still fail after 3 rounds, proceed anyway — note the remaining issues in the PR body so they're visible. Shipping with a known issue is better than looping forever.

## Step 5: Commit

Check if you're on the default branch (main/master). If so, create a new branch first:
```
git checkout -b feat/yolo-<short-description>
```
Pick a short description from the changes (e.g., `feat/yolo-add-biome-config`).

Generate a conventional commit message by analyzing the staged diff:
- Run `git diff --cached --stat` for an overview
- Run `git diff --cached` for the actual changes
- Run `git log --oneline -5` to match the project's commit style

Use standard conventional commit types: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`, `build`, `ci`, `perf`. Pick the dominant type. Keep the subject under 72 characters. Add a body for non-trivial changes.

Always include the co-author trailer:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

Use a HEREDOC to pass the message:
```bash
git commit -m "$(cat <<'EOF'
type(scope): subject line

Body if needed.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Step 6: Push

Check if the branch has an upstream:
```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
```

- If no upstream: `git push -u origin <current-branch>`
- If upstream exists: `git push`

If push is rejected (remote has new commits), try once:
```bash
git pull --rebase && git push
```

Never force push. If it still fails, stop and tell the user.

## Step 7: Create PR

Check if a PR already exists:
```bash
gh pr view --json number 2>/dev/null
```

If no PR exists, create one:
```bash
gh pr create --title "<conventional commit subject>" --body "$(cat <<'EOF'
## Summary
- <bullet points from the diff>

🤖 Generated with Claude Code
EOF
)"
```

If checks didn't fully pass in Step 4, add a note:
```
> ⚠ Some checks did not pass after 3 fix attempts. See details above.
```

## Step 8: Squash and Merge

Try to merge immediately:
```bash
gh pr merge --squash --delete-branch
```

If that fails because of required reviews or status checks, enable auto-merge instead:
```bash
gh pr merge --squash --auto --delete-branch
```

If merge fails for other reasons (conflicts, permissions), report the error and stop. Don't attempt conflict resolution — that crosses the line from yolo to reckless.

## Guardrails

These are the lines yolo mode won't cross:
- **Never force push** — rewrites shared history
- **Never commit directly to main/master** — always branch first
- **Never resolve merge conflicts automatically** — too risky to get wrong
- **Cap fix iterations at 3** — avoid infinite loops
- **Abort on empty diff** — don't create empty commits
- **Never skip git hooks** — if a hook fails, fix the issue
