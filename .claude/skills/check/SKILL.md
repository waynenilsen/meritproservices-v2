---
name: check
description: Run `bun run check` and fix any errors or warnings it reports. Use when the user asks to check, lint, or validate the codebase.
---

# Check

Run the project's check script and fix any issues found.

## Steps

1. Run `bun run check` and capture the output
2. If the command exits cleanly with no errors, report success
3. If there are errors or warnings, fix them:
   - Read the affected files
   - Apply the necessary fixes
   - Re-run `bun run check` to verify the fixes
   - Repeat until all issues are resolved
4. Report what was fixed
