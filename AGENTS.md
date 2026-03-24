<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# currentDate
Today's date is 2026-03-22.

# Next.js 16 Breaking Changes

- **Server Components are the default.** Only add `'use client'` when you need interactivity (hooks, event handlers, browser APIs).
- **Route params are Promises.** Use `params: Promise<{ id: string }>` and `await` them.
- **Nothing is cached by default.** Use the `'use cache'` directive and `cacheLife()` explicitly to enable caching.
- **Instant navigation requires `unstable_instant`.** If client-side navigations feel slow, export `unstable_instant` from the route. Suspense alone is not enough.
- **Only `NEXT_PUBLIC_*` env vars** are exposed to client bundles.

Read `node_modules/next/dist/docs/01-app/` before writing App Router code.

# Project Stack

- **Next.js 16.2** with App Router and React 19
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **shadcn/ui 4** components in `components/ui/` (linting disabled for these files)
- **Biome 2** for linting and formatting (replaces ESLint + Prettier)
- **Bun** as package manager
- **TypeScript 5** with strict mode

# Code Style

- Indent with **tabs** (Biome enforced)
- Use **double quotes** for JS/TS strings (Biome enforced)
- Import order is managed by Biome's `organizeImports` assist
- Use the `cn()` helper from `lib/utils.ts` to merge Tailwind classes
- Use `lucide-react` for icons

# Scripts

```bash
bun run dev           # Dev server
bun run build         # Production build
bun run format        # Format code with Biome
bun run lint:fix      # Lint and fix with Biome
bun run fix:all       # Format + lint + fix (including unsafe fixes)
bun run check:format  # Check formatting (CI)
bun run check:lint    # Check linting (CI)
bun run check:types   # TypeScript type check (CI)
```

# After Making Changes

Always run before committing:

```bash
bun run format && bun run check:lint && bun run check:types
```

# Project Structure

```
app/              # App Router routes (file-based routing)
components/       # React components
  ui/             # shadcn/ui components (do not manually edit)
hooks/            # Custom React hooks
lib/              # Utility functions (cn(), etc.)
public/           # Static assets
scripts/          # Shell scripts (bootstrap, etc.)
```

- Colocate route-specific components within their route segment
- Prefix private folders with `_` to opt out of routing
- Use route groups `(name)` to organize routes without affecting URLs

# Database / Prisma

- **Always use `bunx prisma migrate dev`** to create migrations. Never write migration SQL by hand.
- The local SQLite dev database is disposable — delete it freely if it blocks `migrate dev` (e.g. non-empty table warnings in non-interactive shells).
- After deleting the DB, run `scripts/bootstrap` to re-seed.
- Migration workflow: edit `schema.prisma` → delete `prisma/dev.db` if needed → `bunx prisma migrate dev --name <name>`
