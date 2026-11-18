# Design: Upgrade to the latest Nuxt and first-party Nuxt modules

**Date:** 2026-11-02
**Status:** Awaiting approval
**Branch:** `feat/nuxt-upgrade-agent`

## Intent

Bring the Nuxt 4 migration branch onto the latest stable Nuxt and first-party
Nuxt modules, so the branch starts from current tooling before it replaces
`master`. The user explicitly asked to include `@vueuse/nuxt` even though it is
maintained by the VueUse team rather than the Nuxt team.

## Goals

| Package | From | To |
| --- | --- | --- |
| `nuxt` | `^4.4.7` (installed 4.6.2) | `4.6.3` |
| `@nuxt/fonts` | `0.14.0` | `1.2.0` |
| `@nuxtjs/robots` | `5.7.1` | `7.0.2` |
| `@nuxtjs/sitemap` | `7.6.2` | `9.1.0` |
| `@nuxtjs/color-mode` | `4.0.1` | `4.1.0` |
| `@vueuse/nuxt` | `14.4.0` | `15.0.0` |

`@nuxt/test-utils` is already on the latest `4.3.4`.

## Non-goals

- Nuxt 5 (no stable release yet).
- `nuxt-security` and `@vee-validate/nuxt`; both are already latest.
- Unrelated dependency bumps.
- Adopting new module features (e.g. Robots AI-crawler blocking) beyond what is
  needed to keep current behavior.

## Constraints

- Nuxt `>= 4.6` is required by Robots 7 and Sitemap 9.
- Robots 7 and Sitemap 9 require Node `^22.22.3 || ^24.15.0 || >=26.0.0`; we run
  Node 26.
- Both majors pull in Nuxt Site Config v5 and declare an optional `zod ^4.6.5`
  peer. Zod is only needed if `defineRobotsSchema()` / `defineSitemapSchema()`
  are used; neither is used here, so it should not be added unless npm requires
  it.
- The SEO DevTools panel needs `nuxtseo-devtools-host`; it is optional and does
  not affect builds, so it stays out.
- `@nuxt/fonts` 1.x changes font asset URLs (`/_fonts` → `/_nuxt/fonts` under
  Vite), always minifies injected `@font-face` CSS with lightningcss, and now
  applies the documented `400 700` default weight. This repo vendors its font in
  `ui/assets/styles/fonts.scss` and disables every font provider, so impact
  should be limited, but rendered output must be checked.
- The existing oracle/parity suite defines “no behavior change”.

## Approaches Considered

1. **Incremental, one group at a time (chosen).** Upgrade Nuxt first, verify,
   then modules in small groups: fonts/color-mode, robots+sitemap, vueuse.
   Each step gets lint, typecheck, tests, and a build before moving on. Slower,
   but regressions are attributable and the history stays bisectable.
2. **Big-bang.** Bump everything and fix fallout. Faster to type, much harder to
   attribute breakage to a specific major.
3. **In-range only.** Upgrade Nuxt and color-mode, leave the majors. Rejected
   because the user asked for the latest versions.

## Decisions

- Preserve current site behavior over adopting new module defaults. Adapt
  `nuxt.config.ts` or pin options where a new default would change output.
- Where a module major unavoidably changes generated output, update the code so
  the parity suite still passes. If a difference is benign and unavoidable,
  record it in the migration plan's Intentional Differences list with an
  assertion pinning the new behavior.
- Keep commits focused: Nuxt bump, fonts/color-mode, robots/sitemap, vueuse, plus
  any config/parity fixes.
- Regenerate `package-lock.json` with `npm install`; do not hand-edit it.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:nuxt`
- `npm run build` (or `build-without-nuxt` + `build:nuxt`)
- `scripts/parity.sh` where the Nuxt 2 oracle can run locally
- Spot-check generated `sitemap.xml`, `robots.txt`, and font URLs/assets

## Open Questions

None after scope confirmation.
