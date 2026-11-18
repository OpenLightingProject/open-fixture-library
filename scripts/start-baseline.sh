#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/.worktrees/nuxt2-baseline"

# fixtures/register.json is generated and gitignored, so a freshly created
# worktree does not have it yet and Nuxt 2 aborts without it.
if [[ ! -f fixtures/register.json ]]; then
  npm run build:register
fi

PORT="${PORT:-3001}" exec npm run dev
