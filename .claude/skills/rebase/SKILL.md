---
name: rebase
description: Rebase the current feature branch onto main. Stacked-diff style — squashes to a single commit and force-pushes. For solo developer workflow with one-commit-per-branch.
---

# Rebase: Sync Feature Branch with Main

Rebase the current feature branch onto the latest main, keeping a clean single-commit-per-branch history.

## Workflow

### Step 1: Verify state

```bash
git status
git branch --show-current
```

- If on `main`, tell the user and stop — there's nothing to rebase.
- If the working tree is dirty, ask the user whether to stash or commit first. Do NOT proceed with uncommitted changes.

### Step 2: Fetch latest main

```bash
git fetch origin main
```

### Step 3: Rebase onto main

```bash
git rebase origin/main
```

If there are conflicts:
1. List the conflicted files with `git diff --name-only --diff-filter=U`
2. Open and resolve each conflict
3. Stage resolved files with `git add <file>`
4. Continue with `git rebase --continue`
5. If a conflict is too complex, abort with `git rebase --abort` and explain the situation to the user

### Step 4: Squash into a single commit (if needed)

Check how many commits the branch has ahead of main:

```bash
git log --oneline origin/main..HEAD
```

If there are multiple commits, squash them into one:

```bash
git reset --soft origin/main
git commit -m "$(cat <<'EOF'
<keep the original commit message from the first or most descriptive commit>
EOF
)"
```

If there is already exactly one commit, leave it as-is.

### Step 5: Force-push

```bash
git push --force-with-lease origin HEAD
```

This is safe because:
- It's a solo developer workflow (just one person per branch)
- `--force-with-lease` still protects against unexpected remote changes

### Step 6: Report

Show the user the result:

```bash
git log --oneline -3
git diff --stat origin/main..HEAD
```

Tell the user the rebase is complete and what changed.

## Error Handling

- **Detached HEAD**: Abort and tell the user to check out a branch first
- **Rebase conflicts**: Resolve automatically when possible, abort and explain when not
- **Push rejected even with --force-with-lease**: Someone else pushed to this branch — warn the user and stop
- **No upstream branch**: Push with `git push -u origin HEAD --force-with-lease`
