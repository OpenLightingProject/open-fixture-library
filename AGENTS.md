# AI Agent Guidelines

This file provides guidance for AI coding agents working in this repository.

## Documentation

- **[Developer Documentation overview](docs/README.md)** – repository structure, local setup, folder descriptions
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** – code style, workflow, how to help; always look at this file!
- **[Fixture format](docs/fixture-format.md)** – JSON schema for fixture definitions
- **[Capability types](docs/capability-types.md)** – all capability types supported in fixture definitions
- **[Common fixture mistakes](docs/common-mistakes.md)** – frequent mistakes found during fixture PR review, with before/after examples
- **[Fixture features](docs/fixture-features.md)** – special fixture characteristics used to select test fixtures
- **[Fixture model & API](docs/fixture-model.md)** – classes used to process fixture data; see also the [model API reference](docs/model-api.md)
- **[Plugins](docs/plugins.md)** – how import/export plugins work and how to write one
- **[Testing](docs/testing.md)** – test structure, how to run tests, CI setup
- **[UI / Website](docs/ui.md)** – frontend and Nuxt.js setup
- **[REST API](docs/rest-api.md)** – server-side API endpoints
- **[Environment variables](docs/environment-variables.md)** – configuration via environment variables

## Agent skills

Reusable agent skills live in `.agents/skills/`. That folder is recognised by Codex, Cursor, GitHub Copilot, Gemini CLI, and OpenCode; other agents can read the `SKILL.md` files directly.

- [`fixture-review`](.agents/skills/fixture-review/SKILL.md) — reviewing new fixture-definition PRs (the `new-fixture` label): manual cross-check, master-based validation, and a pending GitHub review.

## Common commands

For validating specific fixtures after changes:

```sh
npm run build:register
node tests/fixtures-valid.js fixtures/<manufacturer>/<fixture>.json
```
