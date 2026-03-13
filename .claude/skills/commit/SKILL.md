---
name: commit
description: Commit staged/unstaged changes using Conventional Commits format. Analyzes the diff, generates a commit message, and commits. Optionally pushes and creates a PR.
---

# Commit: Conventional Commits Workflow

Create a well-structured commit using the Conventional Commits specification.

## Workflow

### Step 1: Check for changes

```bash
git status
git diff --stat
git diff --cached --stat
```

If there are no changes (working tree clean, nothing staged), tell the user and stop.

### Step 2: Review the diff

```bash
git diff
git diff --cached
```

Read the actual changes to understand what was modified and why.

### Step 3: Stage changes

If nothing is staged but there are unstaged changes, stage them:

```bash
git add -A
```

Before committing, review staged files with `git status`. Watch for files that should NOT be committed:

- Secret/env files (`.env`, `.env.local`, credentials)
- Database files (`*.db`, `*.sqlite`)
- Build artifacts (`.next/`, `node_modules/`, `dist/`)
- OS junk (`.DS_Store`, `Thumbs.db`)

If problematic files are staged, add them to `.gitignore` and unstage with `git rm --cached <file>`.

### Step 4: Generate a Conventional Commits message

Analyze the diff and choose the appropriate type:

| Type       | When to use                          |
|------------|--------------------------------------|
| `feat`     | New feature                          |
| `fix`      | Bug fix                              |
| `docs`     | Documentation only                   |
| `style`    | Formatting, no logic change          |
| `refactor` | Code change that neither fixes nor adds |
| `perf`     | Performance improvement              |
| `test`     | Adding or fixing tests               |
| `build`    | Build system or dependencies         |
| `ci`       | CI configuration                     |
| `chore`    | Maintenance, tooling, config         |

Format:

```
<type>[optional scope]: <subject>

[optional body]

[optional footer(s)]
```

Rules for the message:

- **Subject**: imperative mood, lowercase, no period, max 50 chars
- **Scope**: optional, in parentheses — name the area of code affected (e.g., `auth`, `db`, `api`)
- **Body**: explain *why* if the change is non-trivial, separated by a blank line
- **Breaking changes**: add `!` after type/scope OR add `BREAKING CHANGE:` footer
- End the message with: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

### Step 5: Commit

```bash
git commit -m "$(cat <<'EOF'
<type>[scope]: <subject>

<body if needed>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### Step 6: Verify

```bash
git log --oneline -3
```

Report the commit to the user.

### Step 7 (optional): Push and PR

Only if the user asked to push or create a PR:

```bash
git push -u origin HEAD
```

To create a PR:

```bash
gh pr create --title "<type>[scope]: <subject>" --body "$(cat <<'EOF'
## Summary
<bullet points describing changes>

## Test plan
<how to verify>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

## Error Handling

- **Pre-commit hook fails**: Fix the issue, re-stage, create a NEW commit (never amend)
- **Nothing to commit**: Tell the user and stop
- **Push rejected**: Pull and rebase first, then push again
