# Test layout

Tests live in `tests/` (plural). The Vitest setup in `vitest.config.ts` defines
three separate projects so each layer can be run on its own:

| Project | Script | Location | Environment | Purpose |
| --- | --- | --- | --- | --- |
| `unit` | `npm run test:unit` | `tests/unit/**/*.test.{js,ts}` | node | Pure functions from `lib/`, no Nuxt runtime |
| `nuxt` | `npm run test:nuxt` | `tests/nuxt/**/*.nuxt.spec.ts` | `nuxt` (via `@nuxt/test-utils`) | Components and composables that need the Nuxt runtime |
| `e2e` | `npm run test:e2e` | `tests/e2e/contract/**/*.spec.ts` | node | HTTP contract / parity checks against running servers |

Run everything at once with `npx vitest run`. Legacy scripts such as
`npm run test:http-status` and `tests/sitemap-urls.js` are independent of these
projects and are intentionally not part of them.

## Playwright browser suite

`playwright.config.ts` drives `tests/e2e/browser` against an **already running**
server (it does not build or start Nuxt itself):

```bash
npm run test:browser                          # targets http://localhost:3000
TARGET_URL=http://localhost:3001 npm run test:browser
```

`TARGET_URL` selects which site the browser suite talks to. That makes it easy
to run the same suite against the old site and the new site and compare.

## Parity checks

`npm run test:e2e` / `npm run test:parity` use `OLD_URL` and `NEW_URL` to talk
to both sites at once and assert that responses match:

```bash
npm run test:parity   # OLD_URL=http://localhost:3001 NEW_URL=http://localhost:3000
```

### Baseline script

The old (Nuxt 2) site is kept in a separate worktree, `.worktrees/nuxt2-baseline`,
based on `origin/master`. Start it on the port the parity tests expect with:

```bash
scripts/start-baseline.sh        # defaults to PORT=3001
PORT=3002 scripts/start-baseline.sh
```

The script (added in the follow-up task) changes into the worktree and runs its
dev server, so both sites can run side by side. Start the new site separately
with `npm run dev` (port 3000) and then run `npm run test:parity`.
