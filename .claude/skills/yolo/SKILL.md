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

Use GitHub CLI to merge. Prefer squash merge.

**Important**: In Conductor worktrees, `main` is checked out in another worktree. After `gh pr merge`, gh tries to switch to main locally and fails with `fatal: 'main' is already checked out`. The merge itself succeeds via the GitHub API — this is only a local git error. Check the output: if it says "was already merged" or "Merged", the merge succeeded. Only treat it as a real failure if the PR was NOT merged.

```bash
# Create PR if one doesn't exist
gh pr create --fill 2>/dev/null || true

# Merge the PR (squash merge preferred)
# The command may exit non-zero due to the local worktree issue even though the merge succeeded.
gh pr merge --squash --delete-branch
```

If `gh pr merge` exits non-zero, check `gh pr view --json state -q .state` — if it returns `MERGED`, the merge worked and the error is safe to ignore.

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
