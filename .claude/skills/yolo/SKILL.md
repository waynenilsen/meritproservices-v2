---
name: yolo
description: Format, commit, push, and merge to main in one shot. Runs bun format, stages all files, sanity-checks git status, updates .gitignore if needed, commits, pushes to feature branch, and merges to main. Use when the user wants to ship everything on the current branch fast.
---

# Yolo: Format, Commit, Push, Merge

Ship the current branch to main in one shot. No hesitation.

## Workflow

Execute these steps sequentially. Stop and fix issues at any step before continuing.

### Step 1: Format

```bash
bun run format
```

If a `format` script doesn't exist, try `bun run lint` or skip.

### Step 2: Stage everything

```bash
git add .
```

### Step 3: Sanity-check staged files

```bash
git status
```

Review the output. Look for files that should NOT be committed:

- Large binary files, build artifacts, `.next/`, `node_modules/`, `dist/`
- Database files (`*.db`, `*.sqlite`)
- Secret/env files (`.env`, `.env.local`, credentials)
- OS junk (`.DS_Store`, `Thumbs.db`)
- Generated files that are typically gitignored

**If problematic files are staged:**

1. Add patterns to `.gitignore`
2. Run `git rm --cached <file>` for any tracked files that should be ignored
3. Run `git add .` again
4. Re-run `git status` to confirm

### Step 4: Commit

Generate a Conventional Commits message by analyzing the diff:

```bash
git diff --cached --stat
git diff --cached
```

Commit with a clear message:

```bash
git commit -m "<type>[optional scope]: <subject>"
```

- Subject: max 50 chars, imperative mood, no period
- Add body if the change is non-trivial (explain why)

### Step 5: Push to feature branch

```bash
git push -u origin HEAD
```

If the branch already has a remote, just `git push`.

### Step 6: Merge to main

Use GitHub CLI to merge. Prefer squash merge:

```bash
# Create PR if one doesn't exist
gh pr create --fill 2>/dev/null || true

# Merge the PR (squash merge preferred)
gh pr merge --squash --delete-branch
```

### Step 7: Confirm

```bash
git log --oneline -3
```

Report the final state to the user.

## Error Handling

- **Format fails**: Fix the issues, then continue
- **Nothing to commit**: Tell the user, skip remaining steps
- **Push rejected**: Pull and rebase, then push again
- **Merge conflicts**: Stop and ask the user for guidance
- **PR merge fails**: Show the error and provide the PR URL

## Important Rules

- NEVER skip the git status sanity check (Step 3)
- ALWAYS fix .gitignore before committing if junk files are staged
- If on main already, create a feature branch first before committing
- Use `--squash` merge to keep main history clean
