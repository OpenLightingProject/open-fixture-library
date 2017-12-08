# Contributing Guidelines

We believe in the power of open source development and want to encourage everyone to contribute to this project. This document should help new developers and documents our coding workflow. If there are any questions left, don't hesitate to [contact us](https://github.com/FloEdelmann/open-fixture-library/issues/new).

## Issues

You have an idea about a new feature or you spotted a mistake? Feel free to create an [issue](https://github.com/FloEdelmann/open-fixture-library/issues) in which you describe the problem / the feature requirements.

As soon as an issue is assigned to somebody, it means that this person is responsible for fixing it.

## Local installation

1. Install [npm](https://www.npmjs.com/get-npm)
2. [Clone](https://help.github.com/articles/cloning-a-repository/) the repository
3. Navigate into your clone's directory (probably `open-fixture-library/`)
4. Run `npm install`

Now, everything's installed and should be working. To start the website server accessible at [`http://localhost:5000/`](http://localhost:5000/), run `npm run watch` (see [UI docs](ui.md)).

## Where you can help

- Add new fixtures (either via the Fixture Editor or by manually writing a [fixture format JSON](fixture-format.md))
- Improve the [documentation](README.md)
- Browse [good-first-issues](https://github.com/FloEdelmann/open-fixture-library/issues?q=is:open+is:issue+label:%22good+first+issue%22) to find some easy tasks
- Add new [plugins](https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Anew-plugin) (use existing ones as reference and look at the [plugin documentation](plugins.md))
- Implement your own idea (please create a new issue first if it's no bugfix or very minor change)

## Workflow: How to implement a feature

1. [Fork](https://help.github.com/articles/fork-a-repo/) the repository
2. Setup your local installation (see above) with your fork
3. [Create a new branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository/) for your feature
4. Do the needed changes, commit and push them
5. Create a [pull request](https://github.com/FloEdelmann/open-fixture-library/compare) to merge your changes back into our project

You can also create the pull request if you're not done yet to involve the reviewers into the development process and get help if you're stuck. Please include *WIP* (work in progress) in the pull request title then.

## Developer tips

- To understand how OFL works, read the [Documentation Overview](README.md) and its related pages. We try to document every part of our software.
- Run [tests](testing.md) in the `tests/` directory manually – that's way faster than waiting for the automated Travis tests and helps you spot errors quicker.
- Run `make` to be sure that auto-generated contents are up-to-date.
