---
name: Fixture Review
description: Use when reviewing a new fixture-definition pull request in OpenLightingProject/open-fixture-library (the `new-fixture` label) — cross-check the manual against the JSON, validate against current master, and leave a pending GitHub review for the user to check and submit.
---

# Fixture Review

Review a **new fixture definition** PR. This skill adds the agent workflow; the repo docs remain the source of truth.

## Read first

- `AGENTS.md` — the general entry point for this repo.
- `docs/CONTRIBUTING.md#fixtures` — the four review steps and the common fixes. Follow them.
- `docs/common-mistakes.md` — recurring issues with before/after examples.
- `docs/fixture-format.md` and `docs/capability-types.md` — the format and capability reference.

Link to those files in your review instead of copying their contents.

## Scope

Only new fixture definitions (`new-fixture` label). For code, plugins, or changes to existing fixtures, use the normal repo workflow instead.

The user may name any `new-fixture` PR; review that PR. If they ask you to find candidates, issue [#2429](https://github.com/OpenLightingProject/open-fixture-library/issues/2429) links to filtered lists. Prioritise non-draft PRs: the website posts new fixture definitions as drafts, while manually submitted fixtures are usually marked ready for review. Then prefer PRs with passing CI and no review yet.

## 1. Read the PR

Read the metadata first. Use a temporary worktree for the review so you do not clobber the user's working tree.

```sh
gh pr view <N> --repo OpenLightingProject/open-fixture-library \
  --json number,title,author,headRefOid,baseRefName,mergeStateStatus,isDraft,files
```

Confirm the `new-fixture` label, the fixture file(s), and whether the branch is behind:

```sh
git fetch origin master
git rev-list --count <headRefOid>..origin/master
```

If `mergeStateStatus` is `BEHIND`, or the branch is many commits behind, include a review suggestion to rebase or merge `master`. Green CI on an old branch can be stale.

## 2. Build the review workspace from master

**Never run the PR branch's tests.** The PR may be old; its validator, schema, and model can be stale. Validate the fixture against current `origin/master` instead.

```sh
git fetch origin pull/<N>/head:pr-<N>
git worktree add .worktrees/fixture-review-<N> origin/master
cd .worktrees/fixture-review-<N>
npm ci

# Overlay only the PR's changed fixture/resource files.
git checkout pr-<N> -- fixtures/<manufacturer>/<fixture>.json
git checkout pr-<N> -- resources/gobos/<new-gobos>    # if the PR adds any

npm run build:register
```

If your harness has a native worktree tool, use it and create the worktree from `origin/master`. `.worktrees/` is gitignored.

If the PR adds or changes manufacturer entries, redirects, or other fixture metadata, overlay those files too. Do not copy unrelated files from the PR branch.

## 3. Get the authoritative sources

Find at least the three links `CONTRIBUTING.md#fixtures` asks for, preferring English:

- the manual PDF containing the DMX modes,
- the official manufacturer product page,
- a YouTube or Vimeo video.

If the PR has no manual link, search for one that matches the exact model (manufacturer product page, dealer sites, archived PDFs). Use it for the review and add a review comment suggesting the link. If no reliable manual exists, say so: review against the product page/spec sheet and flag the missing manual.

For the manual, download the PDF and extract the DMX table as text:

```sh
curl -L -o manual.pdf '<url>'
pdftotext -layout manual.pdf manual.txt
```

If a site blocks `curl`, use `webfetch`. If the linked manual is an HTML page (e.g. ManualsLib), `pdftotext` does not apply; read the page with `webfetch` or find the official PDF on the manufacturer's product page. If the PR lacks a video, search YouTube; a vintage fixture may only have a demo video.

If the PR links a non-English manual, still check it, but prefer the official English one where available.

## 4. Validate against master

From the master worktree, after overlaying the fixture:

```sh
npm run build:register
node tests/fixtures-valid.js fixtures/<manufacturer>/<fixture>.json
```

Run `npm test` too if the PR changes resources, scripts, or other non-fixture files.

A missing `fixtures/register.json` or a stale `.eslintcache` in a fresh worktree is a setup problem, not a fixture failure: run `npm run build:register` or clear the cache, then rerun.

## 5. Compare the manual with the JSON

Follow the four steps in `CONTRIBUTING.md#fixtures`. Focus on:

- **Modes:** list every mode in the manual, including 1-channel and extended modes the author may have skipped. Compare names, counts, and channel order with `modes`.
- **Channels and capabilities:** for each mode, compare every DMX range and capability type. Read the range from the manual; do not infer it. Check the generated capability names in the validator output for misleading types.
- **Wheels:** compare slot count, order, names, colours, and gobo resources with the manual.
- **Physical and metadata:** dimensions, weight, power, connector, lens, categories, authors, dates, and links.
- **Common mistakes:** use `docs/common-mistakes.md` as the checklist rather than inventing rules.
- **Patterns:** search existing fixtures for analogous capability types or wheel modelling (`rg`). If the manual is ambiguous, add `helpWanted` instead of guessing.

Also check:

- Pan/Tilt `defaultValue` if the manual specifies a neutral value (often `127`).
- `physical.power` and the other physical fields.
- Unused gobo resources, unused channels, unused wheels, and unused wheel slots. The validator does not flag unreferenced gobo resource files; check the `resources/gobos` diff manually.
- Short-name format warnings and suggested categories from the validator.

Do not trust the PR body's claim that a mode or range is undocumented. Verify it in the manual yourself.

If no manual is available, do not invent DMX values. Mark unverifiable parts with `helpWanted` and ask the contributor for the manual.

Record the exact evidence for each finding: file, line, manual page/range, and the expected value.

## 6. Write the review

- Write in English, in plain language. Use the manual's and repo docs' terminology.
- Be direct: what is wrong, where, the correct value, and the evidence.
- Skip filler, praise padding, and hedging.
- Prefer a `suggestion` block for every fix that can be expressed as a local replacement.

## 7. Leave a pending review — never submit

Create a **pending** GitHub review with inline comments and suggestion blocks. Do not call `submitPullRequestReview`, do not create a review with `event: REQUEST_CHANGES`, and do not use the REST `createReview` endpoint; those submit the review immediately.

The review comments go in the `threads` field of `addPullRequestReview`. The legacy `comments` field only supports `position` and cannot use `line`/`startLine`.

1. Get the PR node ID and head OID:

```sh
gh api graphql -f query='query { repository(owner:"OpenLightingProject", name:"open-fixture-library") { pullRequest(number:<N>) { id headRefOid } } }'
```

2. Write a payload file. Paths are relative to the repo root:

```json
{
  "query": "mutation AddDraftReview($input: AddPullRequestReviewInput!) { addPullRequestReview(input: $input) { pullRequestReview { id state url } } }",
  "variables": {
    "input": {
      "pullRequestId": "<PR node ID>",
      "commitOID": "<headRefOid>",
      "body": "Validation result, what matched, what needs changing, and the branch-behind note.",
      "threads": [
        {
          "path": "fixtures/manufacturer/fixture.json",
          "line": 42,
          "side": "RIGHT",
          "body": "Explain the issue.\n\n```suggestion\n          \"type\": \"ShutterStrobe\",\n```"
        }
      ]
    }
  }
}
```

For a multi-line suggestion, add `"startLine"` and `"startSide": "RIGHT"`.

Use a `suggestion` block whenever the exact replacement is local; contributors can apply it with one click. If the fix needs a decision or spans non-contiguous lines, use a code block or prose.

3. Create the pending review and capture the URL:

```sh
gh api graphql --input review.json \
  --jq '.data.addPullRequestReview.pullRequestReview | {state, url}'
```

The result must be `"state": "PENDING"`. Give the user the URL and say the review is ready for them to check, edit, and submit manually.

## 8. Clean up

```sh
cd -
git worktree remove --force .worktrees/fixture-review-<N>
```

`--force` is safe here because the worktree is temporary and contains only the overlaid PR files. Never force-remove a user's worktree. If you changed `fixtures/register.json` in the main checkout, rebuild it. Leave the user's checkout clean.

## Report

Report the pending review URL, the validation result, the blocking findings, the suggestions, and the branch-behind note. Do not say the fixture is approved or ready to merge; it is a draft review.

## Red flags

- You submitted the review or used `REQUEST_CHANGES` instead of a pending review.
- You ran tests from the PR branch instead of `origin/master`.
- You did not mention that the PR is behind `master`.
- You copied the review checklist or common-mistakes list instead of linking to it.
- You trusted the PR body instead of the manual.
- You invented a DMX value because the manual was unclear.
- You left the temporary worktree or modified the user's checkout.
