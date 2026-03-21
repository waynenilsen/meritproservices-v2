#!/usr/bin/env bash
set -euo pipefail

if [ -f ~/.meritproservices-v2.env ]; then
  cat ~/.meritproservices-v2.env >> .env
fi

bun install
