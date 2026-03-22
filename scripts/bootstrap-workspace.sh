#!/usr/bin/env bash
set -euo pipefail

if [ -f ~/.meritproservices-v2.env ]; then
  cat ~/.meritproservices-v2.env >> .env
fi

bun install

# Generate Prisma client, run migrations, and seed
bunx prisma generate
bunx prisma migrate deploy
bun run db:seed
