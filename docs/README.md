# Documentation Overview

This is the developer documentation for the *Open Fixture Library*. Please follow links in the folder structure below to get more information on a specific topic.

## Folder structure

* `cli/` – Useful scripts to be called from the command line
* `docs/` – Documentation (*you are here!*)
* `fixtures/` – Repository of our [fixture definitions](fixture-format.md)
* `lib/` – Reusable modules used in the project
  * `fixture-features/` – [Fixture features](fixture-features.md), special fixture characteristics used to determine a set of test fixtures
  * `model/` – Classes of the [fixture model](fixture-model.md) that help ease processing fixture data
* `plugins/` – [Plugins](plugins.md) for export / import to / from other software's fixture formats
* `static/` – Resources like icons or fonts; used in [UI](ui.md)
* `tests/` – [Unit tests](testing.md), much of them run automatically in GitHub with Travis
  * `github/` – Special kind of tests which shouldn't be called manually and create comments in GitHub pull requests
* `tmp/` – Auto-generated temporary files. Save to delete and not indexed by Git.
* `views/` – Everything related to the [UI / Website](ui.md)
  * `includes/` – Reusable components, helper modules
  * `pages/` – All the different subpages of the website
  * `scripts/` – Client-side JavaScript
  * `stylesheets/` – SASS styles, compiled to `static/style.css` when starting the server

## Contributing

Please see [`CONTRIBUTING.md`](CONTRIBUTING.md).
