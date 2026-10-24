# Nuxt 2 → Nuxt 4 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Nuxt 2 → Nuxt 4 migration so the branch can replace `master`, deploy to production, and remain behaviorally identical to the current site.

**Architecture:** Nuxt 4 (Vue 3, Nitro) serves the entire site. All Express code is removed: OpenAPI handlers run inside a single Nitro catch-all with a bundled OpenAPI document, downloads stay as Nitro middleware, and security/CORS/robots/sitemap move to Nitro/first-party modules. UI code is fully converted to Composition API + TypeScript while preserving master's markup and styling. A comparison harness runs the same contract and Playwright suites against the old Nuxt 2 worktree and the new site, so parity is executable rather than eyeballed.

**Tech Stack:** Nuxt 4.6, Nitro (`node-server` preset), Vue 3, TypeScript, vee-validate, `@nuxt/test-utils` (Vitest projects), `@playwright/test`, Chrome DevTools MCP for visual inspection, PM2/nginx for deployment.

**Spec:** This document embeds the approved design decisions (Approach A — foundation first, then horizontal batches; full Nitro; full Composition API + TypeScript; regular merges from `master`; test only changed surfaces; Playwright pointed at both sites with `build: false, server: false`). There is no separate spec file; the design rationale is summarized in “Design Decisions” below.

## Global Constraints

- Node `26.x`, npm `12.x` (local npm 11 produces only an engine warning).
- No user-visible style or behavior changes. Any unavoidable difference must be added to the **Intentional Differences** list with a reason and an e2e assertion pinning the new behavior.
- No `express` in runtime dependencies after Phase 1; no `from 'express'` anywhere in `ui/`.
- UI source under `ui/` must use `<script setup lang="ts">`; no new Options API. Third-party `.vue` files are exempt.
- Tests are added only for code touched by the migration. Do not add tests for untouched fixtures, docs, or `lib/` logic.
- All new tests must be runnable against the old site where the layer allows it (`tests/e2e/contract`, `tests/e2e/browser`).
- Playwright runs through `@nuxt/test-utils/playwright` with `nuxt: { build: false, server: false }`; target is chosen by `TARGET_URL` (browser) / `OLD_URL` + `NEW_URL` (contract parity).
- Keep the repo's `tests/` directory (do not introduce `test/`). Environment is selected by Vitest project include globs, never by `@vitest-environment` comments.
- Merge `origin/master` into the branch after every phase, and before every parity run. Resolve conflicts by porting master's behavior into the new structure, never by reverting to Nuxt 2 code.
- Do not modify `fixtures/**`, `plugins/**`, `lib/**`, or `schemas/**` unless the migration itself requires it.

## Review Focus

1. **Malformed/unknown API input** — every operation must return a schema-described `400`, never a `500` (`validationFail` path parity).
2. **Fixture redirects and unknown keys** — `/redirected-fixture` must 301/302 with the same `Location` and query, unknown manufacturer/fixture must 404, and no redirect loops may appear.
3. **Downloads for unknown fixture/plugin and excluded plugins** — must match old status codes and `Content-Disposition`/content type; must not leak a 500 from the Nitro middleware.
4. **Editor persistence when `localStorage` is unavailable** — SSR render and privacy-mode client must not crash; autosave/restore must degrade to “no saved data”.
5. **Large fixtures with mode limiting** — `?loadAllModes` and the default 5-mode limit must render the same mode count and not time out.

---

## Design Decisions (approved)

- **Approach A:** stabilize the foundation (server, build, deployability) first, then convert components in horizontal batches, verifying parity after each batch.
- **Server:** full Nitro. No Express compatibility layer. OpenAPI handlers and validation stay, but are hosted by Nitro.
- **UI:** full Composition API + TypeScript conversion; drop `vue-ts-types` and the `VueForm`/`Validate`/`FieldMessages` shim in favor of native vee-validate components.
- **Drift:** merge `origin/master` regularly; no upstream UI freeze.
- **Testing:** existing tests stay; new tests cover only migration surfaces. Contract tests compare old vs new HTTP behavior; Playwright browser tests assert user-visible behavior on both targets.
- **Visual check:** `tests/test-fixtures.json` supplies the feature-representative fixtures for screenshots/DOM assertions; all fixtures are covered by download byte-diff runs.
- **Layout:** one components directory. Audit `.nuxt/components.d.ts` during Task 3, choose the scanned directory (`ui/components` is the default candidate), merge unique `ui/app/components/PropertyInspector/*` work into it, delete the duplicate tree.

## Current State (starting point)

- Branch `feat/nuxt-upgrade-agent` is 0 commits behind `origin/master` (merge commit `e7b54aa2`).
- `npm run build:nuxt` and `npm run test:fixtures-valid` pass; `npm run dev` serves all pages.
- Known defects to fix in this plan: production API reads `openapi.json` relative to `import.meta.url` (fails in `.output`), `/api/v1/rdm?...` 500s via nuxt-security's bundled `xss` (`escapeHtml is not a function`), vee-validate rule names mismatch emitted `data-exclusive-*` keys, duplicate component trees, lint/typecheck not green.
- Local fonts: master vendors Atkinson Hyperlegible Next woff2; the branch switched to Google-hosted `@nuxt/fonts`. Parity requires using the same font files.

## File Structure (target)

```
vitest.config.ts                  # unit / nuxt / e2e projects
playwright.config.ts              # @nuxt/test-utils/playwright, build:false, server:false
tests/
  unit/                           # pure Node tests (existing dmx-value-scaling moves here)
  nuxt/                           # Nuxt-environment tests (mountSuspended, mockNuxtImport)
  e2e/
    helpers/parity.ts             # OLD_URL/NEW_URL fetching + equality helpers
    contract/                     # API, downloads, SEO/headers parity
    browser/                      # Playwright user-visible behavior
  test-fixtures.json              # existing feature matrix (unchanged)
cli/build-openapi-bundle.js       # dereference ui/api/openapi.json -> ui/api/openapi.bundled.json
ui/server/
  api/v1/[...slug].ts             # Nitro catch-all -> OpenAPI backend
  middleware/download.ts          # existing ported download middleware
  utils/download.ts               # existing ported download helpers
  utils/api.ts                    # OpenAPI backend instance + validation
ui/components/                    # single component tree (audited in Task 3)
ui/pages/, ui/layouts/, ui/plugins/, ui/assets/, ui/public/
ui/api/
  openapi.json                    # source spec (unchanged)
  openapi.bundled.json            # generated, committed
  routes/                         # framework-agnostic handlers (unchanged)
  routes.js                       # handler registry (unchanged)
```

---

## Phase 0 — Baseline and comparison harness

### Task 1: Add Vitest projects and Playwright runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tests/unit/README.md` (short note explaining project split)
- Move: `tests/dmx-value-scaling.test.js` → `tests/unit/dmx-value-scaling.test.js`

**Interfaces:**
- Produces: npm scripts `test:unit`, `test:nuxt`, `test:e2e`, `test:browser`, `test:parity`.
- Produces: Playwright config reading `TARGET_URL` (default `http://localhost:3000`).

- [ ] **Step 1: Add dev dependencies**

Run:
```bash
npm install -D @nuxt/test-utils @playwright/test happy-dom playwright
npx playwright install chromium
```

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { defineVitestProject } from '@nuxt/test-utils/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.{js,ts}'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.nuxt.spec.ts'],
          environment: 'nuxt',
        },
      }),
      {
        test: {
          name: 'e2e',
          include: ['tests/e2e/contract/**/*.spec.ts'],
          environment: 'node',
          testTimeout: 30_000,
        },
      },
    ],
  },
});
```

- [ ] **Step 3: Move the existing unit test and update scripts**

```bash
mkdir -p tests/unit
git mv tests/dmx-value-scaling.test.js tests/unit/dmx-value-scaling.test.js
```

In `package.json` scripts replace `test:dmx-value-scaling` invocation and add:
```json
"test:unit": "vitest run --project unit",
"test:nuxt": "vitest run --project nuxt",
"test:e2e": "vitest run --project e2e",
"test:browser": "playwright test",
"test:parity": "OLD_URL=http://localhost:3001 NEW_URL=http://localhost:3000 npm run test:e2e"
```

- [ ] **Step 4: Write `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';
import type { ConfigOptions } from '@nuxt/test-utils/playwright';

export default defineConfig<ConfigOptions>({
  testDir: 'tests/e2e/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    nuxt: {
      rootDir: '.',
      build: false,
      server: false,
      host: process.env.TARGET_URL ?? 'http://localhost:3000',
    },
  },
});
```

- [ ] **Step 5: Document the project split**

Write `tests/unit/README.md` describing the three Vitest projects (`unit`, `nuxt`, `e2e`), the Playwright target switch (`TARGET_URL`, `OLD_URL`, `NEW_URL`), and the baseline script from Task 2.

- [ ] **Step 6: Verify the setup**

Run:
```bash
npm run test:unit
npx playwright test --list
```
Expected: the moved Vitest test file runs and passes; Playwright lists zero or existing tests without error.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts playwright.config.ts tests/
git commit -m "test: add vitest projects and playwright parity runner"
```

### Task 2: Create the old-site baseline worktree and parity helpers

**Files:**
- Create: `tests/e2e/helpers/parity.ts`
- Create: `tests/e2e/contract/api.smoke.spec.ts`
- Create: `scripts/start-baseline.sh` (dev helper, documented in `tests/unit/README.md`)

**Interfaces:**
- Produces: `OLD_URL`, `NEW_URL`, `fetchBoth(path, init?)`, `expectParity(path, init?)` from `tests/e2e/helpers/parity.ts`.
- `expectParity` asserts equal status, equal `content-type`, and deep-equal JSON bodies (or byte-equal non-JSON bodies).

- [ ] **Step 1: Create the old site worktree and install**

```bash
git worktree add .worktrees/nuxt2-baseline origin/master
cd .worktrees/nuxt2-baseline && npm ci
```

- [ ] **Step 2: Add the baseline start script**

`scripts/start-baseline.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/.worktrees/nuxt2-baseline"
PORT="${PORT:-3001}" exec npm run dev
```
Run `chmod +x scripts/start-baseline.sh` and document it in `tests/unit/README.md`.

- [ ] **Step 3: Write `tests/e2e/helpers/parity.ts`**

```ts
import assert from 'node:assert/strict';

export const OLD_URL = process.env.OLD_URL ?? 'http://localhost:3001';
export const NEW_URL = process.env.NEW_URL ?? 'http://localhost:3000';

export async function fetchBoth(path: string, init?: RequestInit) {
  const [oldResponse, newResponse] = await Promise.all([
    fetch(`${OLD_URL}${path}`, init),
    fetch(`${NEW_URL}${path}`, init),
  ]);
  return { oldResponse, newResponse };
}

export async function expectParity(path: string, init?: RequestInit) {
  const { oldResponse, newResponse } = await fetchBoth(path, init);
  assert.equal(newResponse.status, oldResponse.status, `status for ${path}`);
  assert.equal(
    newResponse.headers.get('content-type'),
    oldResponse.headers.get('content-type'),
    `content-type for ${path}`,
  );

  const contentType = oldResponse.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    assert.deepEqual(await newResponse.json(), await oldResponse.json(), `body for ${path}`);
  }
  else {
    const [oldBody, newBody] = await Promise.all([
      oldResponse.arrayBuffer(),
      newResponse.arrayBuffer(),
    ]);
    assert.deepEqual(Buffer.from(newBody), Buffer.from(oldBody), `body for ${path}`);
  }
}
```

- [ ] **Step 4: Write the first failing parity smoke test**

`tests/e2e/contract/api.smoke.spec.ts`:
```ts
import { describe, it } from 'vitest';
import { expectParity } from '../helpers/parity';

describe('API parity smoke', () => {
  it('serves the manufacturer list identically', async () => {
    await expectParity('/api/v1/manufacturers');
  });

  it('serves a manufacturer identically', async () => {
    await expectParity('/api/v1/manufacturers/clay-paky');
  });

  it('serves the category list identically', async () => {
    await expectParity('/api/v1/categories');
  });
});
```

- [ ] **Step 5: Start both sites and run the test**

Terminal A:
```bash
cd .worktrees/nuxt2-baseline && PORT=3001 npm run dev
```
Terminal B:
```bash
PORT=3000 npm run dev
```
Run:
```bash
npm run test:parity
```
Expected: all three pass. If any fail, record the difference in the task notes before proceeding — these are baseline defects, not test bugs.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e scripts .gitignore
git commit -m "test: add old-site baseline and API parity harness"
```

### Task 3: Audit and consolidate the conversion state

**Files:**
- Inspect: `.nuxt/components.d.ts`
- Modify: `nuxt.config.ts` (only if component dirs must be narrowed)
- Delete: duplicate tree identified below
- Create: `docs/superpowers/migration-audit.md` (findings + decisions; short)

**Deliverable:** a written decision on the canonical component directory and a list of converted components that are stubs/mismatched, with each found item fixed or scheduled into the owning Phase 2 batch.

- [ ] **Step 1: Determine the scanned component directories**

Run `npx nuxt prepare`, then:
```bash
grep -n "ui/components\|ui/app/components" .nuxt/components.d.ts | head -20
```
Record which directory(ies) Nuxt scans. Decision rule: keep the scanned directory that contains the majority of components (`ui/components` unless evidence says otherwise); `ui/app/**` is deleted after unique work is ported.

- [ ] **Step 2: Diff the duplicate components**

```bash
diff -ru ui/app/components ui/components | tee /tmp/component-dupes.diff
```
For each duplicate, keep the version that preserves master's current behavior and port any unique logic from the other. In particular check `DownloadButton.vue`, `PropertyInspector/*` vs `PropertyInput*`.

- [ ] **Step 3: Find conversion stubs**

```bash
grep -rn "defineExpose({})\|const dialog = null\|const newCapability = null\|<!-- TODO" ui --include='*.vue' --include='*.ts'
```
Every hit must be fixed in this task or added to the owning Phase 2 batch's file list in `docs/superpowers/migration-audit.md`.

- [ ] **Step 4: Every already-converted component must render in the dev server**

Start `npm run dev`, then with Chrome DevTools MCP visit `/`, `/clay-paky/sharpy`, `/fixture-editor`, `/import-fixture-file`, and check the console for errors. Record failures in the audit doc.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/migration-audit.md ui/
git commit -m "chore: audit and consolidate partial nuxt migration"
```

---

## Phase 1 — Full Nitro backend (remove Express)

### Task 4: Bundle the OpenAPI document and run it in Nitro

**Files:**
- Create: `cli/build-openapi-bundle.js`
- Create: `ui/server/utils/api.ts`
- Create: `ui/server/api/v1/[...slug].ts`
- Modify: `package.json` (`build:openapi`, include in `build-without-nuxt`; add `@apidevtools/json-schema-ref-parser` devDependency)
- Modify: `tests/built-files-committed.js` (include the bundled spec)
- Delete after migration: `ui/api/index.js`, `ui/api/download.js`
- Test: `tests/e2e/contract/api.smoke.spec.ts` extended

**Interfaces:**
- `build-openapi-bundle.js` writes `ui/api/openapi.bundled.json` with all `$ref`s resolved and no external file references.
- `ui/server/utils/api.ts` exports `api: OpenAPIBackend` configured with handlers from `ui/api/routes.js`.
- Catch-all returns the handler's `body` with `statusCode`, `content-type: application/json`, and CORS headers.

- [ ] **Step 1: Write a failing test for the production bundle path**

Add to `tests/e2e/contract/api.smoke.spec.ts`:
```ts
it('serves API routes without external $ref lookups', async () => {
  const response = await fetch(`${process.env.NEW_URL ?? 'http://localhost:3000'}/api/v1/categories`, {
    headers: { accept: 'application/json' },
  });
  expect(response.status).toBe(200);
});
```
Run `npm run build:nuxt && PORT=3000 node .output/server/index.mjs` and the test — it currently 500s because `.output/server/openapi.json` is missing.

- [ ] **Step 2: Implement the bundle script**

`cli/build-openapi-bundle.js` uses `@apidevtools/json-schema-ref-parser`:
```js
import { readFile, writeFile } from 'node:fs/promises';
import $RefParser from '@apidevtools/json-schema-ref-parser';

const specPath = new URL('../ui/api/openapi.json', import.meta.url);
const bundled = await $RefParser.bundle(specPath.pathname);
await writeFile(new URL('../ui/api/openapi.bundled.json', import.meta.url), `${JSON.stringify(bundled, null, 2)}\n`);
```
Add `"build:openapi": "node cli/build-openapi-bundle.js"` and prepend it in `build-without-nuxt`. Commit the generated file.

- [ ] **Step 3: Implement the Nitro API backend**

`ui/server/utils/api.ts`:
```ts
import { OpenAPIBackend } from 'openapi-backend';
import addFormats from 'ajv-formats';
import openapi from '~~/ui/api/openapi.bundled.json';
import * as routeHandlers from '~~/ui/api/routes.js';

export const api = new OpenAPIBackend({
  definition: openapi as never,
  strict: process.env.NODE_ENV !== 'production',
  customizeAjv(ajv) {
    addFormats(ajv);
    return ajv;
  },
  handlers: {
    ...routeHandlers,
    validationFail({ validation, request, operation }) {
      return { statusCode: 400, body: { error: `Invalid request for ${operation?.operationId}` } };
    },
    notFound: () => ({ statusCode: 404, body: { error: 'Not found' } }),
    methodNotAllowed: () => ({ statusCode: 405, body: { error: 'Method not allowed' } }),
    notImplemented: () => ({ statusCode: 501, body: { error: 'No handler registered for operation' } }),
  },
});
```
`ui/server/api/v1/[...slug].ts` calls `api.handleRequest({ method, path: event.path, headers, query, body })`, maps `statusCode`/`body` to the H3 response, and returns `body`. Do not use `apiRoot` if the bundled spec already includes the `/api/v1` server prefix — verify with the smoke test and set `apiRoot: '/api/v1'` only if needed.

- [ ] **Step 4: Run the full API parity suite**

Extend `tests/e2e/contract/api.smoke.spec.ts` with every GET endpoint:
`/api/v1/fixtures/count`, `/api/v1/fixtures/last-updated`, `/api/v1/contributors/recent`, `/api/v1/plugins`, `/api/v1/plugins/{key}`, `/api/v1/categories`, `/api/v1/categories/{name}`, `/api/v1/manufacturers`, `/api/v1/manufacturers/{key}`, `/api/v1/rdm?manufacturerId=1`.

Add edge-case parity tests:
```ts
it('rejects a malformed POST body with 400 parity', async () => {
  await expectParity('/api/v1/fixtures/import', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
});

it('returns 404 parity for an unknown operation', async () => {
  await expectParity('/api/v1/not-an-operation');
});
```

Run:
```bash
npm run test:parity
```
Expected: pass on both. Then rebuild and run against the production server:
```bash
npm run build && PORT=3000 node .output/server/index.mjs
```
and re-run with `NEW_URL=http://localhost:3000`.

- [ ] **Step 5: Commit**

```bash
git add cli/build-openapi-bundle.js ui/server ui/api/openapi.bundled.json package.json tests/
git commit -m "feat: serve the OpenAPI backend from Nitro"
```

### Task 5: Download middleware parity

**Files:**
- Modify: `ui/server/middleware/download.ts`, `ui/server/utils/download.ts` (only if bugs found)
- Test: `tests/e2e/contract/downloads.spec.ts`

**Interfaces:**
- Consumes: the running servers at `OLD_URL`/`NEW_URL`.
- Produces: `downloadCases` list `{ fixtureKey, pluginKey }` from `tests/test-fixtures.json` fixtures × `plugins/plugins.json` export plugins.

- [ ] **Step 1: Write failing download parity tests**

`tests/e2e/contract/downloads.spec.ts`:
```ts
import { describe, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { expectParity } from '../helpers/parity';

// Resolve these from tests/test-fixtures.json once its structure is inspected in Task 3.
const fixtureKeys = [
  'clay-paky/sharpy',
  'american-dj/flat-par-qa12',
];

const plugins = JSON.parse(await readFile(new URL('../../../plugins/plugins.json', import.meta.url), 'utf8')).exportPlugins;

describe('download parity', () => {
  for (const fixtureKey of fixtureKeys) {
    for (const pluginKey of plugins) {
      it(`${fixtureKey}.${pluginKey}`, async () => {
        await expectParity(`/${fixtureKey}.${pluginKey}`);
      });
    }
  }

  it('unknown plugin is rejected identically', async () => {
    await expectParity('/clay-paky/sharpy.not-a-plugin');
  });
});
```
Add a `FULL_DOWNLOAD_MATRIX=1` mode that iterates every fixture from `fixtures/register.json`; keep the default suite on `tests/test-fixtures.json`.

- [ ] **Step 2: Run and fix**

```bash
npm run test:parity
```
Expected initially: failures for headers/content-disposition or redirects. Fix `ui/server/utils/download.ts` until green. Do not change old-site behavior (it is the oracle).

- [ ] **Step 3: Verify in the production bundle**

```bash
npm run build && PORT=3000 node .output/server/index.mjs
npm run test:parity
```

- [ ] **Step 4: Commit**

```bash
git add ui/server tests/e2e/contract/downloads.spec.ts
git commit -m "test: enforce download parity and fix nitro download middleware"
```

### Task 6: CORS, security headers, robots, sitemap

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `ui/server/middleware/*.ts` (add CORS if routeRules is insufficient)
- Test: `tests/e2e/contract/seo.spec.ts`
- Test: `tests/e2e/contract/headers.spec.ts`

**Interfaces:**
- Produces: parity assertions for `content-security-policy`, `x-frame-options`, `x-content-type-options`, `referrer-policy`, `access-control-allow-origin`, `/robots.txt`, `/sitemap.xml`.

- [ ] **Step 1: Write the failing header/SEO parity tests**

`tests/e2e/contract/headers.spec.ts` compares the security header values on `/` and `/api/v1/categories`; `seo.spec.ts` compares `/robots.txt` and normalizes `/sitemap.xml` `<lastmod>` before comparing URL sets. Run `npm run test:parity` and record each difference.

- [ ] **Step 2: Fix differences**

- CORS: implement master's whitelist logic (non-production allow, OFL domains, fallback `https://open-fixture-library.org`) in a Nitro middleware or `routeRules`, then re-run.
- Security headers: configure `nuxt-security` to emit the same headers master's `nuxt-helmet` did; remove or replace headers that cannot be emitted identically.
- Fix `/api/v1/rdm?manufacturerId=9999` 500 (`escapeHtml is not a function`). Prefer disabling nuxt-security's request-body XSS validator for API routes — OpenAPI validation is the source of truth — and add a regression test asserting 200 parity for valid and invalid RDM IDs.

- [ ] **Step 3: Verify and commit**

```bash
npm run test:parity
git add nuxt.config.ts ui/server tests/e2e/contract
git commit -m "fix: align security headers, CORS, robots and sitemap with master"
```

### Task 7: Font parity (vendored Atkinson Hyperlegible Next)

**Files:**
- Create: `ui/public/fonts/AtkinsonHyperlegibleNext/AtkinsonHyperlegibleNext-Variable.woff2`
- Create: `ui/public/fonts/AtkinsonHyperlegibleNext/AtkinsonHyperlegibleNext-Italic-Variable.woff2`
- Create: `ui/public/fonts/AtkinsonHyperlegibleNext/OFL.txt`
- Create: `ui/assets/styles/fonts.scss`
- Modify: `nuxt.config.ts` (fonts module configuration, preload link, `css` order)
- Test: `tests/e2e/browser/typography.spec.ts`

**Interfaces:**
- Body text resolves to the same font family and the browser reports the font as loaded: `document.fonts.check('12pt "Atkinson Hyperlegible Next"') === true`.

- [ ] **Step 1: Write the failing typography test**

`tests/e2e/browser/typography.spec.ts`:
```ts
import { expect, test } from '@nuxt/test-utils/playwright';

test('body uses the vendored Atkinson Hyperlegible Next font', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' });
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Atkinson Hyperlegible Next');
  expect(await page.evaluate(() => document.fonts.check('12pt "Atkinson Hyperlegible Next"'))).toBe(true);
});
```
Run against the old site (`TARGET_URL=http://localhost:3001`) to validate the assertion: PASS. Run against the new site: currently the Google-hosted variant may report differently — record the result.

- [ ] **Step 2: Copy master's exact font files**

```bash
mkdir -p ui/public/fonts/AtkinsonHyperlegibleNext
cp .worktrees/nuxt2-baseline/ui/static/fonts/AtkinsonHyperlegibleNext/* ui/public/fonts/AtkinsonHyperlegibleNext/
```

- [ ] **Step 3: Serve the files with `@font-face`**

Add `ui/assets/styles/fonts.scss` with the same declarations master uses (weights `200 800`, normal and italic, `font-display: fallback`), import it before `style.scss` in `nuxt.config.ts`'s `css` array, remove the Google `fonts.families` entry, and add master's preload `<link>` with `crossorigin` to `app.head.link`. If `@nuxt/fonts` can serve these exact local files via its local provider, prefer that over the raw `@font-face` (still no Google download).

- [ ] **Step 4: Verify and commit**

```bash
TARGET_URL=http://localhost:3000 npm run test:browser -- typography.spec.ts
npm run build
git add ui/public/fonts ui/assets/styles/fonts.scss nuxt.config.ts tests/e2e/browser/typography.spec.ts
git commit -m "fix: vendor master's atkinson font files for visual parity"
```

### Task 8: Remove Express and the legacy API host

**Files:**
- Delete: `ui/api/index.js`, `ui/api/download.js`
- Modify: `package.json` (remove `express`, `cors`, `nuxt-security`'s express-only deps if unused)
- Test: `tests/e2e/contract/api.smoke.spec.ts` (unchanged, must stay green)

- [ ] **Step 1: Confirm no runtime references**

```bash
grep -rn "from 'express'\|from \"express\"\|require('express')" ui lib server
```
Expected: no matches under `ui/`.

- [ ] **Step 2: Remove files and dependencies, rebuild, run everything**

```bash
rm ui/api/index.js ui/api/download.js
npm uninstall express cors
npm run build:nuxt
npm run test:parity
```
Expected: all parity tests pass in dev and against the production build.

- [ ] **Step 3: Commit**

```bash
git add ui/api package.json package-lock.json
git commit -m "refactor: remove express from the runtime"
```

---

## Phase 2 — Full Composition API + TypeScript conversion

**Rules for every batch task:**
1. Write/extend parity or `tests/nuxt` tests that cover the batch's user-visible behavior before converting.
2. Convert files to `<script setup lang="ts">`; replace `vue-ts-types` props with `defineProps<Props>()`/`withDefaults`.
3. Keep templates and `<style>` blocks byte-identical unless a Vue 3 requirement forces a change; any forced markup/style change gets an Intentional Difference entry.
4. Run the batch's tests, `npm run lint`, and `npm run typecheck` before committing.
5. Merge `origin/master` after each batch, rerun parity, then commit the merge.

### Task 9: Replace the vee-validate compatibility shim

**Files:**
- Delete: `ui/plugins/vue-form.ts`, `ui/components/VueForm.vue`, `ui/components/Validate.vue`, `ui/components/FieldMessages.vue`
- Modify: `ui/plugins/vee-validate.ts`
- Modify: every component using `<VueForm>`, `<Validate>`, `<FieldMessages>`
- Test: `tests/nuxt/vee-validate.nuxt.spec.ts`
- Test: `tests/e2e/browser/editor-validation.spec.ts`

**Interfaces:**
- Rule names must match emitted keys exactly: `step`, `data-exclusive-minimum`, `data-exclusive-maximum`, `complete-range`, `valid-range`, `categories-not-empty`, `complete-dimensions`, `start-with-uppercase-or-number`, `no-mode-name`, `no-fine-channel-name`, `entity-complete`, `entities-have-same-units`, `valid-color-hex-list`, `max-file-size`.
- `entity-complete` and `entities-have-same-units` read the component's exposed `hasNumber`/`selectedNumber`/`hasSameUnit` via the field registration data, not Vue 2 `vnode.componentInstance`.

- [ ] **Step 1: Write failing rule tests**

`tests/nuxt/vee-validate.nuxt.spec.ts` uses `mockNuxtImport` if needed and asserts each rule's true/false cases (e.g. `data-exclusive-minimum('5', '3') === true`, `'2' === false`; `entities-have-same-units` with equal/unequal unit objects).

- [ ] **Step 2: Run to see them fail against the current mismatched names**

```bash
npm run test:nuxt
```
Expected: FAIL for `data-exclusive-*` and entity rules.

- [ ] **Step 3: Implement the rules and remove the shim**

Update `ui/plugins/vee-validate.ts`; replace shim usage in editor components with vee-validate's `Form`/`Field` semantics or the components' existing `vf:validate` contract. Delete the three shim components and `ui/plugins/vue-form.ts`.

- [ ] **Step 4: Verify**

```bash
npm run test:nuxt
npm run test:parity
```
Then run the editor e2e path (Task 17 covers full flow; here assert that invalid fields show messages and valid data submits to preview).

- [ ] **Step 5: Commit**

```bash
git add ui/plugins ui/components tests/nuxt tests/e2e/browser
git commit -m "refactor: replace vue-form shim with native vee-validate"
```

### Task 10: Batch A — primitives and shared components

**Files (convert all to `<script setup lang="ts">`):**
`ui/components/` — `A11yDialog.vue`, `CapabilityTypeIcon.vue`, `CategoryBadge.vue`, `ChannelTypeIcon.vue`, `ClimateStrikeBanner.vue`, `ConditionalDetails.vue`, `DownloadButton.vue`, `FixtureHeader.vue`, `HeaderBar.vue`, `HelpWantedDialog.vue`, `HelpWantedMessage.vue`, `LabeledInput.vue`, `LabeledValue.vue`, `MasonryCardContainer.vue`, `OflDate.vue`, `OflSvg.vue`, `PropertyInputBoolean.vue`, `PropertyInputDimensions.vue`, `PropertyInputEntity.vue`, `PropertyInputNumber.vue`, `PropertyInputRange.vue`, `PropertyInputSelect.vue`, `PropertyInputText.vue`, `PropertyInputTextarea.vue`, `ThemeSwitcher.vue`.

**Test:** `tests/e2e/browser/home.spec.ts`, `tests/nuxt/ofl-svg.nuxt.spec.ts`, `tests/nuxt/property-inputs.nuxt.spec.ts`

**Interfaces:**
- `OflSvg` props: `type?: string`, `name?: string`, `colors?: string[]`, `title?: string`.
- `PropertyInput*` keep the existing `v-model` (prop `modelValue`, emit `update:modelValue`) and `vf:validate` contracts.
- `DownloadButton` props: `fixtureCount?`, `editorFixtures?`, `fixtureKey?`, `buttonStyle?`, `showHelp?`.

- [ ] **Step 1: Write characterization tests**

- `home.spec.ts`: at both `TARGET_URL` targets, assert title, download button text, recent fixtures/contributors render, and theme switcher toggles.
- `ofl-svg.nuxt.spec.ts`: `mountSuspended` `OflSvg` with `name="alert"` yields an `<svg>` with `role="img"`; unknown name throws.
- `property-inputs.nuxt.spec.ts`: number validation data equals the emitted `data-exclusive-*` values; entity unit changes emit `entities-have-same-units`.

- [ ] **Step 2: Run tests — they must pass before conversion (characterization gate)**

```bash
TARGET_URL=http://localhost:3001 npm run test:browser -- home.spec.ts
npm run test:nuxt
```
Expected: PASS on the old site and new site/current components. If a test fails now, fix the test to describe current behavior.

- [ ] **Step 3: Convert the files**

Convert props to `defineProps<Props>()`, replace `vue-ts-types` with native types, replace `model: { prop, event }` with `defineModel`, keep template/style identical. Remove now-unused `vue-ts-types` imports.

- [ ] **Step 4: Verify no Options API remains and tests pass**

```bash
grep -L "<script setup" ui/components/*.vue
npm run test:nuxt
npm run test:parity
npm run lint
```
Expected: `grep -L` prints nothing; all tests green.

- [ ] **Step 5: Commit**

```bash
git add ui/components tests
git commit -m "refactor: convert shared components to composition api and typescript"
```

### Task 11: Batch B — fixture page components

**Files:** `ui/components/fixture-page/FixturePage.vue`, `FixturePageCapabilityTable.vue`, `FixturePageChannel.vue`, `FixturePageMatrix.vue`, `FixturePageMode.vue`, `FixturePagePhysical.vue`, `FixturePageWheel.vue`

**Test:** `tests/e2e/browser/fixture-page.spec.ts`

**Interfaces:** components keep their existing props; `FixturePage` additionally consumes `manufacturerColor?: string | null`.

- [ ] **Step 1: Write the fixture page parity test**

Use the feature matrix from `tests/test-fixtures.json` (resolve its shape first; it is a JSON list/object of fixture keys). Assert on both targets:
- title contains manufacturer + fixture name;
- mode cards count equals the old site (with and without `?loadAllModes`);
- matrix/wheel sections render when expected;
- help-wanted dialog opens and closes;
- redirected fixture lands on the target URL with the same `Location` (see `fixtures/register.json` for candidates);
- unknown manufacturer and unknown fixture both return 404 parity.

- [ ] **Step 2: Run on the old site to validate assertions**

```bash
TARGET_URL=http://localhost:3001 npm run test:browser -- fixture-page.spec.ts
```

- [ ] **Step 3: Convert the batch**

Apply the Phase 2 rules. Keep computed logic identical (especially `channelKey`, wheel geometry, mode limits, `switchChannels` rendering including `?? 'No Function'`).

- [ ] **Step 4: Verify on both sites**

```bash
TARGET_URL=http://localhost:3001 npm run test:browser -- fixture-page.spec.ts
TARGET_URL=http://localhost:3000 npm run test:browser -- fixture-page.spec.ts
npm run test:parity
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add ui/components/fixture-page tests/e2e/browser
git commit -m "refactor: convert fixture page components to composition api"
```

### Task 12: Batch C — editor core components

**Files:** `ui/components/editor/` — `EditorCapability.vue`, `EditorCapabilityTypeData.vue`, `EditorCapabilityWizard.vue`, `EditorCategoryChooser.vue`, `EditorChannelDialog.vue`, `EditorChooseChannelEditModeDialog.vue`, `EditorFileUpload.vue`, `EditorFixtureInformation.vue`, `EditorLink.vue`, `EditorLinks.vue`, `EditorManufacturer.vue`, `EditorMode.vue`, `EditorPhysical.vue`, `EditorProportionalPropertySwitcher.vue`, `EditorRestoreDialog.vue`, `EditorSubmitDialog.vue`, `EditorWheelSlot.vue`, `EditorWheelSlots.vue`

**Test:** `tests/e2e/browser/editor.spec.ts`, `tests/nuxt/editor-utilities.nuxt.spec.ts`

**Interfaces:** preserve all emitted events (`open-channel-editor`, `remove-channel`, `channel-changed`, `insert-capability-before/after`, `restore-complete`, `success`, `reset`) and public methods (`validate`, `cleanCapabilityData`, `focus`, `setUnitString`, `hasSameUnit`).

- [ ] **Step 1: Write the editor flow test (fails only where current conversion is broken)**

Flow: open `/fixture-editor` → fill manufacturer/name/categories → add mode → open channel dialog → add channel from wizard → add a capability → set DMX range → save → validate → preview dialog opens. Assert messages/state, not internals. Also cover autosave restore (reload with `localStorage.autoSave` seeded) and discard. Add a separate test that overrides `Storage.prototype.setItem` to throw, reloads `/fixture-editor`, and asserts the page still renders and no uncaught error is logged.

- [ ] **Step 2: Run against the old site to lock behavior**

```bash
TARGET_URL=http://localhost:3001 npm run test:browser -- editor.spec.ts
```

- [ ] **Step 3: Convert the batch, including the `$set`/`$delete` → array/proxy equivalents and `$refs` → `useTemplateRef`**

- [ ] **Step 4: Verify**

```bash
npm run test:nuxt
npm run test:parity
TARGET_URL=http://localhost:3000 npm run test:browser -- editor.spec.ts
npm run lint && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add ui/components/editor tests
git commit -m "refactor: convert editor core components to composition api"
```

### Task 13: Batch D — capability and wheel-slot components

**Files:** every file in `ui/components/editor/capabilities/` and `ui/components/editor/wheel-slots/`.

**Test:** `tests/e2e/browser/capability-wizard.spec.ts`

- [ ] **Step 1: Write/extend the wizard test**

Open the capability wizard, generate a multi-capability range, assert count/ranges, then exercise one capability of each family (color, gobo, prism, strobe, fog, focus/zoom) through the type data form.

- [ ] **Step 2: Convert the files**

Mostly prop/typeData plumbing; keep `vf:validate` payload keys unchanged.

- [ ] **Step 3: Verify and commit**

```bash
grep -L "<script setup" ui/components/editor/capabilities/*.vue ui/components/editor/wheel-slots/*.vue
npm run test:nuxt && npm run test:parity
git add ui/components/editor && git commit -m "refactor: convert capability and wheel-slot components"
```

### Task 14: Batch E — pages and layouts

**Files:** all `ui/pages/**/*.vue` and `ui/layouts/*.vue`, plus `ui/app.vue` if present.

**Test:** `tests/e2e/browser/pages.spec.ts`

- [ ] **Step 1: Write a page matrix test**

For each route: `/`, `/about`, `/about/plugins`, `/about/plugins/{plugin}`, `/categories`, `/categories/{category}`, `/manufacturers`, `/{manufacturer}`, `/{manufacturer}/{fixture}`, `/search`, `/rdm`, `/fixture-editor`, `/import-fixture-file` — assert title, h1, and one stable landmark per page on both targets. Normalize Nuxt-2-vs-3 payload artifacts.

- [ ] **Step 2: Convert pages/layouts**, keeping `useFetch`/`useHead` composition as already established; remove any remaining Options API.

- [ ] **Step 3: Verify and commit**

```bash
npm run test:parity && TARGET_URL=http://localhost:3000 npm run test:browser
git add ui/pages ui/layouts ui/app.vue
git commit -m "refactor: convert pages and layouts to composition api"
```

### Task 15: Remove `vue-ts-types` and finish TS types

**Files:** `package.json`, all remaining imports, `ui/types/`

- [ ] **Step 1: Find remaining usage**

```bash
grep -rn "vue-ts-types" ui
```
Expected after Tasks 9–14: only files not yet converted. Convert them or remove the dependency if none remain.

- [ ] **Step 2: Add explicit model types**

Create/complete `ui/types/models.d.ts` re-exporting the JS model classes' shapes used by components (`Fixture`, `AbstractChannel`, `Capability`, `Wheel`, `WheelSlot`, `Mode`, `Entity`). Import these types in component props instead of `any`/`object`.

- [ ] **Step 3: Verify and commit**

```bash
npm uninstall vue-ts-types
npm run typecheck
npm run test:nuxt && npm run test:parity
git add ui package.json package-lock.json
git commit -m "refactor: drop vue-ts-types and type component props explicitly"
```

---

## Phase 3 — Parity verification

### Task 16: Full visual/DOM comparison

**Files:** `tests/e2e/contract/visual.spec.ts`, `tests/e2e/contract/helpers/normalize.ts`

- [ ] **Step 1: Implement normalization**

`normalize.ts` strips: Nuxt payload scripts, hydration/comment markers, asset hashes, `data-v-*` attributes, and whitespace-only text nodes. Keep classes, ids, text, links, image `src` basenames.

- [ ] **Step 2: Write the comparison test**

For each fixture in `tests/test-fixtures.json` and each static page, use `fetchBoth` from `tests/e2e/helpers/parity.ts`, normalize the HTML, and assert equality of `title`, `h1`, headings, link hrefs, image `alt/src`, and interactive controls. Record any allowlisted differences. This test runs in the Vitest `e2e` project, not Playwright.

- [ ] **Step 3: Run, fix, and commit**

```bash
npm run test:parity
git add tests/e2e/contract
git commit -m "test: add normalized DOM parity matrix"
```

### Task 17: Editor end-to-end parity

**Files:** `tests/e2e/browser/editor-full.spec.ts`

- [ ] **Step 1: Cover the complete create → validate → preview flow**, plus: duplicate channel, edit mode, remove channel, 16-bit fine channels, restore dialog, download-from-editor, prefill query (`?prefill=`), RDM lookup prefill.
- [ ] **Step 2: Stub submission**

Intercept `POST /api/v1/fixtures/submit` and `from-editor` with Playwright route mocking; assert the request body shape (not a real GitHub call).
- [ ] **Step 3: Run on both targets, fix, commit**

```bash
TARGET_URL=http://localhost:3001 npm run test:browser -- editor-full.spec.ts
TARGET_URL=http://localhost:3000 npm run test:browser -- editor-full.spec.ts
git add tests/e2e/browser && git commit -m "test: add full editor flow parity coverage"
```

### Task 18: Full download matrix (opt-in)

**Files:** `tests/e2e/contract/downloads.spec.ts` (`FULL_DOWNLOAD_MATRIX` branch)

- [ ] **Step 1: Implement the full mode** iterating `fixtures/register.json` × `plugins/plugins.json`.
- [ ] **Step 2: Run `FULL_DOWNLOAD_MATRIX=1 npm run test:parity`** against both servers; expect byte equality. If a failure is intentional, add it to Intentional Differences with a reason and a targeted assertion.
- [ ] **Step 3: Commit**

---

## Phase 4 — Quality gates

### Task 19: Green lint and typecheck

**Files:** `eslint.config.js`, `package.json`, `nuxt.config.ts`, offending sources

- [ ] **Step 1: Add TypeScript toolchain**

```bash
npm install -D typescript@^6 vue-tsc@latest
```
Add scripts:
```json
"typecheck": "nuxt typecheck",
"lint:eslint": "eslint --cache"
```

- [ ] **Step 2: Make lint green**

Rules already match master's refactor. Fix or narrowly disable (with a comment) remaining violations. Keep `vue/no-undef-components: off` only for `ui/**` (Nuxt auto-imports) and document it; do not disable unrelated rules.

- [ ] **Step 3: Make typecheck green**

Fix type errors in converted components and server routes. Prefer precise types over suppressions; any `@ts-expect-error` must name the external cause.

- [ ] **Step 4: Verify and commit**

```bash
npm run lint && npm run typecheck && npm run test:unit && npm run test:nuxt
git add . && git commit -m "chore: make lint and typecheck green"
```

### Task 20: CI and docs

**Files:** `.github/workflows/test.yaml`, `docs/ui.md`, `docs/download-routes-migration.md`, `docs/rest-api.md` (regenerate), `README.md`, `AGENTS.md`

- [ ] **Step 1: Update CI** to run `lint`, `typecheck`, `test:unit`, `test:nuxt`, `build`, and Playwright against the built server (`TARGET_URL` from a backgrounded `node .output/server/index.mjs`). Add `playwright install --with-deps chromium`.
- [ ] **Step 2: Add a manual/nightly parity workflow** (or document `scripts/parity.sh`) that checks out `origin/master`, installs its deps (cached), starts both servers, and runs `npm run test:parity` + full download matrix.
- [ ] **Step 3: Update docs** for the new folder structure, testing commands, Nitro API, and remove stale Nuxt 2 claims.
- [ ] **Step 4: Regenerate API docs and commit**

```bash
npm run build:openapi && npm run build:api-docs
git add .github docs README.md AGENTS.md
git commit -m "docs: update for the nuxt 4 stack and parity tests"
```

---

## Phase 5 — Deployment and merge

### Task 21: Production deployment configuration

**Files:** `server/ecosystem.config.js`, `server/redeploy.sh`, `server/webhook.js`, `server/nginx-site-available`, `docs/environment-variables.md`

- [ ] **Step 1: Update PM2 to run the Nitro output**

`server/ecosystem.config.js`: app script `./.output/server/index.mjs`, `env: { NODE_ENV: 'production', PORT: 3000, HOST: '127.0.0.1' }`, same app name/log paths. Remove Nuxt 2-specific env.

- [ ] **Step 2: Update redeploy**

`server/redeploy.sh`: `npm ci && npm run build && pm2 reload <app> --update-env`. Keep nginx reverse proxy unchanged if it already targets `127.0.0.1:3000`. Document the Node 26 requirement.

- [ ] **Step 3: Local production smoke**

```bash
npm run build
PORT=3000 node .output/server/index.mjs
npm run test:parity
```
Then `curl -sI` for `/`, `/sitemap.xml`, `/robots.txt`, an API route, and a download.

- [ ] **Step 4: Commit**

```bash
git add server docs/environment-variables.md
git commit -m "chore: deploy the nitro server with pm2"
```

### Task 22: Final merge, parity, and cutover

- [ ] **Step 1: Merge master and re-verify**

```bash
git fetch origin
git merge origin/master
# resolve by porting master's behavior into the Nuxt 4 structure
npm ci
npm run lint && npm run typecheck && npm run test:unit && npm run test:nuxt
npm run build
npm run test:parity
```
- [ ] **Step 2: Run the full comparison suite one last time** with both servers fresh (`test:parity`, full download matrix, browser suite, visual matrix). Record the final Intentional Differences list in `docs/superpowers/migration-audit.md`.
- [ ] **Step 3: Open the PR to master**, include the parity evidence and a rollback note (redeploy previous `master` commit via PM2 + nginx unchanged).
- [ ] **Step 4: Cutover**: merge, let the existing webhook redeploy, verify live `/`, a fixture page, an API route, a download, sitemap/robots, and check PM2 logs for 5xx errors for 24h.

---

## Intentional Differences

| Difference | Reason | Pinned by |
|---|---|---|
| Nuxt/Vue hydration comments and payload script format in HTML | Framework-internal markup; not user-visible | `normalize.ts` strips them in DOM parity tests |
| Asset hashes and font file names in URLs | Bundler output differs | normalized in DOM parity tests |
| (add entries only when a user-visible difference is unavoidable; each needs a test) | | |

## Verification Commands

```bash
# unit / nuxt / e2e layers
npm run test:unit
npm run test:nuxt
npm run test:e2e

# parity (old worktree on :3001, new site on :3000)
npm run dev                              # new site, port 3000
cd .worktrees/nuxt2-baseline && PORT=3001 npm run dev   # old site
npm run test:parity
TARGET_URL=http://localhost:3001 npm run test:browser   # old
TARGET_URL=http://localhost:3000 npm run test:browser   # new

# quality gates
npm run lint
npm run typecheck
npm run build
PORT=3000 node .output/server/index.mjs
```

**Acceptance criteria:**
- All parity suites green (API, downloads, headers/SEO, pages, editor, visual matrix) against both sites.
- No user-visible difference except entries in the Intentional Differences table.
- `npm run build` produces a server that serves pages, API, downloads, robots and sitemap without missing files.
- `express` is gone from the dependency tree and the source.
- Lint and typecheck pass; CI runs unit/nuxt/build/Playwright; parity runs nightly/manually.
- PM2/nginx configuration deploys the Nitro server and the live cutover checklist is complete.
