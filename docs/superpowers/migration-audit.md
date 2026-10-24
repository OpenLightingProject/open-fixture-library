# Nuxt 4 migration audit (Task 3)

Date: 2026-10-24 · Branch: `feat/nuxt-upgrade-agent`

## Decision: canonical component directory

**`ui/components` is the only component directory.** `ui/app/components` is deleted.

Evidence:

- `nuxt.config.ts` sets `srcDir: 'ui'` and does not configure `dir.app`, so Nuxt 4's `app/` convention is not active.
- After `npx nuxt prepare`, every Open Fixture Library component in `.nuxt/components.d.ts` resolves to `../ui/components/...` (e.g. `DownloadButton`, `FixtureHeader`, `PropertyInputText`). There are no `ui/app/components` entries.
- `ui/components` contains 106 components; `ui/app/components` contained 10. Nothing outside the duplicate tree referenced `ui/app`.
- No `nuxt.config.ts` change is required.

The old Nuxt 2 worktree (`.worktrees/nuxt2-baseline`) was used as the behavior oracle.

## Duplicate tree reconciliation

`diff -ru ui/app/components ui/components` and per-file comparison against the Nuxt 2 oracle:

| `ui/app/components` file | Canonical counterpart | Decision |
| --- | --- | --- |
| `DownloadButton.vue` | `ui/components/DownloadButton.vue` | Kept canonical. Ported two pieces of lost master behavior: `Content-Disposition` filename parsing for editor downloads, and the two `text-decoration: none` declarations. The app copy's `$axios` fallback was not ported (Nuxt 4 has no `$axios`; the canonical `$fetch` implementation is the working equivalent). |
| `FixtureHeader.vue` | `ui/components/FixtureHeader.vue` | Kept canonical. App copy was byte-identical to Nuxt 2 (`::v-deep`); canonical already uses Vue 3 `:deep()`. It has no behavior. |
| `PropertyInspector/Boolean.vue` | `PropertyInputBoolean.vue` | Kept canonical. Ported null handling (`modelValue: boolean \| null`, `Boolean(props.modelValue)`) from the app version, which also matches how the editor calls it (`constant: null`). |
| `PropertyInspector/Number.vue` | `PropertyInputNumber.vue` | Kept canonical. Ported the missing `exclusiveMinimum`/`exclusiveMaximum` computed values from the app version (also present in Nuxt 2). Their absence caused a `ReferenceError` on `/fixture-editor`. |
| `PropertyInspector/Dimensions.vue` | `PropertyInputDimensions.vue` | Kept canonical. App version is an equivalent partial `defineModel` rewrite with a malformed multi-line `:name`; no unique behavior. |
| `PropertyInspector/Entity.vue` | `PropertyInputEntity.vue` | Kept canonical. App version drops the exposed `hasSameUnit`/`setUnitString` methods needed by the editor and imports `~~/../lib/schema-properties` (outside the project root); no unique behavior. |
| `PropertyInspector/Range.vue` | `PropertyInputRange.vue` | Kept canonical. App copy is an unfinished Options API file that imports a non-existent `./PropertyInputNumber.vue`. |
| `PropertyInspector/Select.vue` | `PropertyInputSelect.vue` | Kept canonical. App copy is the stale Options API/vue-ts-types version. |
| `PropertyInspector/Text.vue` | `PropertyInputText.vue` | Kept canonical. App copy is the stale Options API/vue-ts-types version. |
| `PropertyInspector/Textarea.vue` | `PropertyInputTextarea.vue` | Kept canonical. App copy is the stale Options API/vue-ts-types version. |

All 10 files under `ui/app/` were removed with `git rm -r ui/app`.

## Conversion stub scan

Command from the brief:

```bash
grep -rn "defineExpose({})\|const dialog = null\|const newCapability = null\|<!-- TODO" ui --include='*.vue' --include='*.ts'
```

Only hit: `ui/components/editor/EditorWheelSlot.vue:139 defineExpose({})`.

- Fixed: removed the empty expose. No parent accesses a ref to `EditorWheelSlot` (`EditorWheelSlots.vue` renders it without a ref), and `typeData` is a separate template ref, so this was a no-op.
- `ui/components/editor/EditorCapabilityWizard.vue:87` contains a pre-existing upstream `TODO` about duplicated capability-table logic. It is not a conversion stub; left unchanged.

## Dev-server render check

`PORT=3005 npm run dev`, then Playwright (Chromium) loaded each route in a fresh browser context. Final state:

| Route | HTTP | Title / h1 | Result |
| --- | --- | --- | --- |
| `/` | 200 | Open Fixture Library / Open Fixture Library | Renders; hydration warning (below) |
| `/clay-paky/sharpy` | 200 | Clay Paky Sharpy … / Clay Paky Sharpy | Renders; hydration warning + external poster images fail with `ERR_CERT_AUTHORITY_INVALID` |
| `/fixture-editor` | 200 | Fixture Editor … / Fixture Editor | Renders after fixes; three Vue warnings remain (below) |
| `/import-fixture-file` | 200 | Import fixture … / Import fixture file | Renders; hydration warning |

Notes:

- Before this task, `/fixture-editor` rendered Nuxt's 500 page (`Failed to execute 'structuredClone' on 'Window'`). Two render blockers were fixed here: the missing `exclusive*` computeds in `PropertyInputNumber` and `structuredClone` of a Vue proxy in `EditorPhysical` (now `toRaw`).
- The `embetty.open-fixture-library.org` certificate failures on `/clay-paky/sharpy` are caused by the sandbox's certificate store, not by application code.
- Every page logs `[Vue warn]: Hydration attribute mismatch ... ThemeSwitcher` followed by `Hydration completed but contains mismatches.` Server renders `title="Switch to light theme"`, client expects `title="Switch to dark theme"`.

## `tests/test-fixtures.json` (fixture matrix for Tasks 5 and 11)

Generated by `npm run build:test-fixtures` (`cli/build-test-fixtures.js`). Parse it as a plain JSON array — there is no wrapper object.

Exact shape: **22 entries**, each `{ man: string, key: string, name: string, features: string[] }`
(e.g. `{ "man": "afx", "key": "lmh460z", "name": "LMH460Z", "features": ["capability-type-Pan", …] }`).
The 22 fixtures cover 95 distinct feature strings: all 43 `capability-type-*` types plus 52 structural flags
(`matrix-*`, `wheel-type-*`, `wheel-slot-type-*`, `fine-*`, `switching-*`, `16bit-*`, `null-channels-*`, `redirect-reason-*`, …).

Feature-representative keys (use these for default coverage; `FULL_DOWNLOAD_MATRIX=1` for everything):

| Family | Fixtures |
| --- | --- |
| minimal / `no-physical-data` | `generic/pan-tilt` |
| matrix (`pixelKeys`/`pixelGroups`/custom layout, fine + switched matrix channels, string/number constraints) | `astera/fp3-hyperion-tube`, `cameo/hydrabeam-300-rgbw`, `cameo/auro-beam-150`, `glp/knv-arc`, `prolights/diamond19` |
| wheels (color/gobo/animation gobo/prism/iris/frost, all `wheel-slot-type-*`) | `ayrton/diablo-tc`, `martin/mac-encore-performance`, `martin/mac-axiom-hybrid`, `robe/robin-viva-cmy`, `cameo/auro-spot-400`, `flash-professional/led-moving-head-150w` |
| many modes, switching channels/positions, `switches-fine-channels` | `astera/fp3-hyperion-tube`, `martin/mac-axiom-hybrid`, `robe/robin-viva-cmy`, `cameo/hydrabeam-300-rgbw` |
| 16-bit ranges, fine capabilities, floating-point values | `ayrton/diablo-tc`, `glp/knv-arc`, `martin/mac-encore-performance`, `robe/robin-viva-cmy` |
| fog | `mdg/theone-atmospheric-generator` |
| RDM, `null-channels-*` | `martin/mac-aura`, `robe/robin-viva-cmy`, `mdg/theone-atmospheric-generator` |
| redirects | `stairville/mh-x30` (`FixtureRenamed`), `uking/mini-gobo-moving-head-light` (`SameAsDifferentBrand`) |
| resources, continuous pan/tilt, rotations/blades/laser | `varytec/hero-spot-230` (`wheel-slot-uses-resource`), `cameo/auro-beam-150`, `ayrton/diablo-tc`, `glp/impression-laser` |

Full key list: `afx/lmh460z`, `astera/fp3-hyperion-tube`, `ayrton/diablo-tc`, `cameo/auro-beam-150`, `cameo/auro-spot-400`,
`cameo/hydrabeam-300-rgbw`, `flash-professional/led-moving-head-150w`, `generic/pan-tilt`, `glp/impression-laser`,
`glp/knv-arc`, `martin/mac-aura`, `martin/mac-axiom-hybrid`, `martin/mac-encore-performance`, `martin/mania-scx500`,
`mdg/theone-atmospheric-generator`, `prolights/diamond19`, `qtx/lux-ld01`, `robe/robin-viva-cmy`, `stairville/mh-x30`,
`uking/mini-gobo-moving-head-light`, `varytec/hero-spot-230`, `varytec/hero-wash-340fx-rgbw-zoom`.

## Scheduled findings (owner: Phase 2 batch)

### Task 10 — Batch A (shared/primitive components)

| File | Finding | Action |
| --- | --- | --- |
| `ui/components/ThemeSwitcher.vue` | Color-mode-dependent `title` differs between SSR and client on every route (hydration mismatch). | Make the title SSR-stable (e.g. render a neutral title until mounted, or wrap in `ClientOnly`) and cover with a hydration/theme test. |
| `ui/components/OflDate.vue` | Still Options API and the last non-shim `vue-ts-types` user in `ui/components`. | Convert to `<script setup lang="ts">`; required by Task 15. |
| `ui/components/ConditionalDetails.vue`, `FixtureHeader.vue`, `MasonryCardContainer.vue` | Flagged by `grep -L "<script setup"` but have no `<script>` block at all. | No action; valid scriptless SFCs. |

### Task 12 — Batch C (editor core)

| File | Finding | Action |
| --- | --- | --- |
| `ui/components/editor/EditorChannelDialog.vue:73` | Template uses `singleColors`, which was dropped from the Nuxt 2 `data()` (`capabilityTypes.ColorIntensity.properties.color.enum`). Vue warns at render time and the datalist loses its color suggestions. | Reintroduce as a constant/computed. |
| `ui/components/editor/EditorCategoryChooser.vue:3`, `ui/components/editor/EditorMode.vue:74` | `vuedraggable` v4 requires `itemKey`; both `Draggable` usages omit it. | Add `item-key` (stable category string / channel `uuid`) and verify category and channel drag-and-drop. |
| `ui/components/editor/EditorRestoreDialog.vue:72` | `structuredClone(props.modelValue)` throws `DataCloneError` for reactive auto-save data. | Clone `toRaw(...)` (or JSON round-trip). |
| `ui/components/editor/EditorRestoreDialog.vue:78-82` | Applies restored data through `getCurrentInstance().proxy.$parent` and assigns `parent.fixture`/`parent.channel`; script-setup parent state is not exposed this way. | Replace with explicit emits/props (or a shared store); cover autosave restore in the editor test. |
| `ui/components/editor/EditorSubmitDialog.vue:342,376` | Leftover debug `console.log(..., structuredClone(requestBody.value))` calls will throw on reactive data during validate/submit. | Remove the debug logs; clone raw data only if still needed. |
| `ui/components/editor/EditorCapabilityWizard.vue:196` | `structuredClone(props.wizard.templateCapability.typeData)` can receive a reactive proxy. | Use `toRaw(...)`/JSON clone. |
| `ui/components/editor/EditorChannelDialog.vue:566` | `structuredClone(value)` when copying channel properties can receive proxy values. | Use `toRaw(...)`/JSON clone. |
| `ui/assets/scripts/editor-utilities.js:271` | `structuredClone(channel)` is called with editor state that may be reactive. | Accept/convert raw input before cloning; add a restore-path test. |

### Other batches

- **Task 9:** no new findings; `VueForm.vue`, `Validate.vue`, `FieldMessages.vue`, and `ui/plugins/vue-form.ts` remain as planned shims.
- **Task 11:** no load-time findings on `/clay-paky/sharpy`; full matrix/wheel parity remains Task 11/16 work.
- **Task 13:** no load-time findings. Wizard interactions were not exercised here.
- **Task 14:** all pages/layouts are already `<script setup>` and load; the only global console issue is the ThemeSwitcher hydration mismatch (Task 10).

## Intentional differences

None introduced by this task. The `DownloadButton` style/filename changes restore Nuxt 2 behavior; no new user-visible difference is expected.

## Verification

| Command | Result |
| --- | --- |
| `npx nuxt prepare` | Pass; `.nuxt/components.d.ts` references only `ui/components` |
| `npm run build:nuxt` | Pass |
| `npm run test:unit` | Pass (1 file, 65 tests) |
| `npm run test:nuxt` | No test files exist yet (`tests/nuxt/**` is added in later tasks); not a code failure |
| Dev-server route check | All four routes return 200 and render their page content |
