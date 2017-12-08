# Contributing Guidelines

We belief in the power of open source development and want to encourage everyone to contribute to this project. This document should help new developers and documents our coding workflow. If there are any questions left, don't hesitate [contacting us](https://github.com/FloEdelmann/open-fixture-library/issues/new).

## Issues

You have an idea about a new feature or you spotted an error? Feel free to create an [issue](https://github.com/FloEdelmann/open-fixture-library/issues) in which you describe the problem / the feature requirements.

As soon as an issue is assigned by somebody, it means that this person is responsible for fixing it.

## Local installation

1. Open a command line interface
2. Install [npm](https://www.npmjs.com/get-npm)
3. [Clone](https://help.github.com/articles/cloning-a-repository/) the repository
4. Navigate into your clone's directory (probably `open-fixture-library/`)
5. Run `npm install`

Now, everything's installed and should be working. To start the website server accessible at [`http://localhost:5000/`](http://localhost:5000/), run `npm run watch`.

## Where you can help

- Browse [good-first-issues](https://github.com/FloEdelmann/open-fixture-library/issues?q=is:open+is:issue+label:%22good+first+issue%22) to find some easy tasks
- Add new [plugins](https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Anew-plugin) (use existing ones as reference and look at the [plugin documentation](plugins.md))
- Implement your own idea (please create a new issue first if it's no bugfix or very minor change)

## Workflow: How to implement feature X

1. [Fork](https://help.github.com/articles/fork-a-repo/) the repository
2. Setup your local installation (see above) with your fork repository
3. Do the needed changes for feature X, commit and push them
4. Create a [Pull Request](https://github.com/FloEdelmann/open-fixture-library/compare) to merge your changes back into our project

You can also create the Pull Request if you're not done yet to involve the reviewers into the development process and get help if you're stuck.

## Developer tips

- To understand how OFL works, read the [Documentation Overview](overview.md) and its related pages. We try to document every part of our software.
- Run [tests](testing.md) in the `tests/` directory manually – that's way faster than waiting for the automated Travis tests and helps you spot errors quicker.
- Run `make` to be sure that auto-generated contents are up-to-date.