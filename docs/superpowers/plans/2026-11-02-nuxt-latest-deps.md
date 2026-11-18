# Nuxt & First-Party Modules Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Nuxt 4 migration branch to the latest stable Nuxt and first-party Nuxt modules without changing site behavior.

**Architecture:** Incremental dependency bumps, one group per task. Each task changes only `package.json`/`package-lock.json` plus any minimal config fix, then re-runs the existing verification suite before committing, so a regression is attributable to a single group.

**Tech Stack:** Nuxt 4.6, Vue 3, TypeScript, Nitro (`node-server`), Vitest projects (`unit`, `nuxt`, `http-status`, `e2e`), Playwright, `@nuxt/test-utils`.

**Spec:** `docs/superpowers/specs/2026-11-02-nuxt-latest-deps-design.md`

## Global Constraints

- Node `26.x`; local npm is `11.x` (engines declare 12.x, warning only).
- Nuxt must be `4.6.3` before Robots 7 / Sitemap 9 (they require Nuxt `>= 4.6`).
- Runtime deps to reach: `nuxt@4.6.3`, `@nuxt/fonts@1.2.0`, `@nuxtjs/robots@7.0.2`, `@nuxtjs/sitemap@9.1.0`, `@nuxtjs/color-mode@4.1.0`, `@vueuse/nuxt@15.0.0`.
- Do not add `zod` unless `npm install` fails or a module requires it at build time; this repo does not use `defineRobotsSchema()` / `defineSitemapSchema()`.
- Do not add `nuxtseo-devtools-host`; the DevTools SEO panels are optional and not part of this upgrade.
- No user-visible behavior change. Preserve existing `nuxt.config.ts` behavior over new module defaults.
- Regenerate `package-lock.json` with `npm install`; never hand-edit it.
- Do not bump unrelated packages.

## Review Focus

1. **Sitemap output** — `/sitemap.xml` must contain the same URLs, `changefreq`, `lastmod`, ordering, and no credits/XSL. Covered by Task 3 and the parity suite.
2. **robots.txt output** — `/robots.txt` must keep the same allow/disallow/sitemap lines and no header/meta injection. Covered by Task 3 and the parity suite.
3. **Font assets** — the vendored Atkinson Hyperlegible Next must still load from `/fonts/...`, with no 404s or duplicate/malformed `@font-face`. Covered by Task 2.
4. **SSR/runtime behavior** — Nuxt 4.6 and VueUse 15 must not break SSR, auto-imports, or the editor. Covered by `test:unit`, `test:nuxt`, and parity.
5. **Peer resolution** — `npm install` must resolve Site Config 5 and not leave unmet peers. Covered by Task 3.

---

### Task 1: Upgrade Nuxt to 4.6.3

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: current `package.json` with `"nuxt": "^4.4.7"`.
- Produces: `"nuxt": "4.6.3"` installed; no source or config changes expected.

- [ ] **Step 1: Confirm the current tree is green**

Run: `git status --short && npm run test:unit && npm run test:nuxt`
Expected: clean tree; unit tests (75) and nuxt tests (53) pass.

- [ ] **Step 2: Set the Nuxt version**

In `package.json`, change `"nuxt": "^4.4.7"` to `"nuxt": "4.6.3"`.

- [ ] **Step 3: Install and regenerate the lockfile**

Run: `npm install --no-audit --no-fund`
Expected: install succeeds; `package-lock.json` records `node_modules/nuxt` version `4.6.3`.

- [ ] **Step 4: Verify static checks and tests**

Run: `npm run lint && npm run typecheck && npm run test:unit && npm run test:nuxt`
Expected: lint exits 0 (warnings allowed), typecheck exits 0, 75 unit tests and 53 nuxt tests pass.

- [ ] **Step 5: Verify the production build**

Run: `npm run build:nuxt`
Expected: build succeeds and `.output/server/index.mjs` exists.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): upgrade nuxt to 4.6.3"
```

---

### Task 2: Upgrade `@nuxt/fonts` and `@nuxtjs/color-mode`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify only if needed: `nuxt.config.ts`

**Interfaces:**
- Consumes: `nuxt@4.6.3` from Task 1.
- Produces: `@nuxt/fonts@1.2.0`, `@nuxtjs/color-mode@4.1.0`; `fonts.providers` and `colorMode` config keys stay valid.

- [ ] **Step 1: Set the versions**

In `package.json`, change:
- `"@nuxt/fonts": "^0.14.0"` → `"@nuxt/fonts": "1.2.0"`
- `"@nuxtjs/color-mode": "^4.0.0"` → `"@nuxtjs/color-mode": "4.1.0"`

- [ ] **Step 2: Install**

Run: `npm install --no-audit --no-fund`
Expected: install succeeds; lockfile records the two new versions.

- [ ] **Step 3: Verify static checks and tests**

Run: `npm run lint && npm run typecheck && npm run test:unit && npm run test:nuxt`
Expected: all pass.

- [ ] **Step 4: Verify font and color-mode output**

Run: `npm run build:nuxt`, start `node .output/server/index.mjs` in the background, then `curl -s http://localhost:3000/ | grep -o 'data-theme="[^"]*"'` and `curl -sI http://localhost:3000/fonts/AtkinsonHyperlegibleNext/AtkinsonHyperlegibleNext-Variable.woff2`. Stop the server afterwards.
Expected: `data-theme` is present; the font request returns `200`; the HTML preload still points at `/fonts/AtkinsonHyperlegibleNext/AtkinsonHyperlegibleNext-Variable.woff2`; no `/_nuxt/fonts` URL replaces the vendored font.

- [ ] **Step 5: Fix config only if Step 4 shows a regression**

If `@nuxt/fonts` 1.x emits a provider-resolved face or rewrites the vendored URL, pin the family explicitly in `nuxt.config.ts`:

```ts
fonts: {
  families: [
    { name: 'Atkinson Hyperlegible Next', provider: 'none' },
  ],
  // existing providers block stays
}
```

Re-run Step 4 after any change.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts
git commit -m "chore(deps): upgrade @nuxt/fonts and @nuxtjs/color-mode"
```

---

### Task 3: Upgrade `@nuxtjs/robots` and `@nuxtjs/sitemap`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify only if needed: `nuxt.config.ts`

**Interfaces:**
- Consumes: `nuxt@4.6.3` from Task 1.
- Produces: `@nuxtjs/robots@7.0.2`, `@nuxtjs/sitemap@9.1.0`, Site Config 5 transitively; existing `robots` and `sitemap` option keys remain supported.

- [ ] **Step 1: Capture the current output**

Run: `npm run build:nuxt`, start `node .output/server/index.mjs` in the background, then:
`curl -s http://localhost:3000/sitemap.xml > /tmp/sitemap.before.xml`
`curl -s http://localhost:3000/robots.txt > /tmp/robots.before.txt`
Stop the server afterwards.
Expected: both files are non-empty.

- [ ] **Step 2: Set the versions**

In `package.json`, change:
- `"@nuxtjs/robots": "^5.7.1"` → `"@nuxtjs/robots": "7.0.2"`
- `"@nuxtjs/sitemap": "^7.6.0"` → `"@nuxtjs/sitemap": "9.1.0"`

- [ ] **Step 3: Install and check peer resolution**

Run: `npm install --no-audit --no-fund && npm ls @nuxtjs/site-config zod`
Expected: install succeeds; `@nuxtjs/site-config` resolves to a 5.x version; `zod` is either absent or satisfies `^4.6.5`; no `UNMET PEER DEPENDENCY` lines.

- [ ] **Step 4: Verify static checks and tests**

Run: `npm run lint && npm run typecheck && npm run test:unit && npm run test:nuxt`
Expected: all pass.

- [ ] **Step 5: Compare generated output**

Run: `npm run build:nuxt`, start `node .output/server/index.mjs` in the background, then:
`curl -s http://localhost:3000/sitemap.xml > /tmp/sitemap.after.xml`
`curl -s http://localhost:3000/robots.txt > /tmp/robots.after.txt`
`diff /tmp/sitemap.before.xml /tmp/sitemap.after.xml`
`diff /tmp/robots.before.txt /tmp/robots.after.txt`
Stop the server afterwards.
Expected: no diff, or only an intended/benign diff that is recorded in Step 6.

- [ ] **Step 6: Fix config only if Step 5 shows a regression**

- If Sitemap 9 ignores `sitemap.urls`, move the function to `sitemap: { sources: [...] }` or keep `urls: sitemapUrls` if still supported (it is in 9.1.0).
- If `cacheMaxAgeSeconds`, `xsl`, or `credits` warn, keep the existing values; they remain in the 9.1.0 option type.
- If Robots 7 drops `header`, `metaTag`, or `credits`, remove the dead keys only after confirming the output is unchanged.
- If the sitemap now excludes URLs because indexing is disabled, set `sitemap: { excludeAppSources: true }` and keep `robots.disallow` empty as today.

Re-run Steps 4 and 5 after any change.

- [ ] **Step 7: Run the parity suite**

Run: `PARITY_FULL_MATRIX=0 scripts/parity.sh`
Expected: default parity suite passes. (The full download matrix runs in Task 5.)

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts
git commit -m "chore(deps): upgrade @nuxtjs/robots and @nuxtjs/sitemap"
```

---

### Task 4: Upgrade `@vueuse/nuxt`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `nuxt@4.6.3` from Task 1.
- Produces: `@vueuse/nuxt@15.0.0`; no source changes expected because the app does not import VueUse composables directly.

- [ ] **Step 1: Set the version**

In `package.json`, change `"@vueuse/nuxt": "^14.3.0"` → `"@vueuse/nuxt": "15.0.0"`.

- [ ] **Step 2: Install**

Run: `npm install --no-audit --no-fund`
Expected: install succeeds; lockfile resolves `@vueuse/core` 15.x.

- [ ] **Step 3: Verify static checks and tests**

Run: `npm run lint && npm run typecheck && npm run test:unit && npm run test:nuxt`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): upgrade @vueuse/nuxt to 15"
```

---

### Task 5: Full verification and intentional-difference bookkeeping

**Files:**
- Modify only if needed: `docs/superpowers/plans/2026-10-24-nuxt4-migration.md` (Intentional Differences section)

**Interfaces:**
- Consumes: all upgrades from Tasks 1–4.
- Produces: a fully verified branch with a clean, committed tree.

- [ ] **Step 1: Run the complete local suite**

Run: `npm run lint && npm run typecheck && npm run test:unit && npm run test:nuxt && npm run test:fixtures-valid`
Expected: all pass.

- [ ] **Step 2: Run the full build**

Run: `npm run build`
Expected: build succeeds; no unstaged changes in tracked generated files.

- [ ] **Step 3: Run the full parity suite**

Run: `scripts/parity.sh`
Expected: default and full-download parity pass.

- [ ] **Step 4: Record any intended differences**

If Step 3 reveals a benign, unavoidable output change, add it to the Intentional Differences list in `docs/superpowers/plans/2026-10-24-nuxt4-migration.md` with the reason and the assertion that pins it. If there are none, leave the file untouched.

- [ ] **Step 5: Commit any remaining changes**

```bash
git add -A
git commit -m "test: verify latest Nuxt and module upgrade"
```

- [ ] **Step 6: Push the branch**

```bash
git push luke feat/nuxt-upgrade-agent
```
