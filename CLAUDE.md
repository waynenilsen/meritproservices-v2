# CLAUDE.md

## Project Overview

MeritProServices v2 — a Next.js web application.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: SQLite via Prisma ORM 7
- **UI**: React 19

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `app/generated/prisma/` — Generated Prisma client (gitignored)
- `lib/prisma.ts` — Prisma client singleton (use this to import `prisma`)
- `prisma/schema.prisma` — Database schema
- `prisma/migrations/` — Migration files
- `prisma.config.ts` — Prisma configuration
- `tests/` — Test files (Bun test runner)

## Commands

- `bun run dev` — Start dev server
- `bun run build` — Generate Prisma client + build for production
- `bun test` — Run tests (uses built-in Bun test runner, `bun:test`)
- `bun run db:migrate` — Create and apply Prisma migrations
- `bun run db:push` — Push schema changes without migration files
- `bun run db:studio` — Open Prisma Studio GUI
- `bun run lint` — Run ESLint

## Database

- SQLite database stored at `prisma/dev.db` (gitignored)
- Always import the Prisma client from `@/lib/prisma` (singleton pattern)
- After schema changes, run `bun run db:migrate` to create a migration
- `prisma generate` runs automatically as part of `bun run build`

## Testing

- Use `bun:test` — no extra test dependencies needed
- Test files go in `tests/` directory with `.test.ts` extension
- Import `{ describe, expect, test }` from `"bun:test"`
