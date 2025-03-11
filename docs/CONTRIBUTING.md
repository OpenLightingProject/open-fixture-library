# Contributing Guidelines

We believe in the power of open source development and want to encourage everyone to contribute to this project. This document should help new developers and documents our coding workflow. If there are any questions left, don't hesitate to [open a new issue](https://github.com/OpenLightingProject/open-fixture-library/issues/new) explaining that you haven't found the information in the docs.

## Developer vibes

Please keep being friendly and don't troll. See our [Code of Conduct](CODE_OF_CONDUCT.md) for more information on this.

## Issues

You have an idea about a new feature or you spotted a mistake? Feel free to create an [issue](https://github.com/OpenLightingProject/open-fixture-library/issues) in which you describe the problem / the feature requirements. Please try to find similar issues first though, and add your information there to keep it organized.

As soon as an issue is assigned to somebody, it means that this person is responsible for fixing it.

## How you can help

### Fixtures

* **Add new fixtures**  
  Either add fixtures via the online [Fixture Editor](https://open-fixture-library.org/fixture-editor) or by manually writing a [fixture format JSON](fixture-format.md).

* **Answer questions in existing fixtures**  
  Go through fixtures you know on the [website](https://open-fixture-library.org/manufacturers) and look for yellow "Help wanted" boxes with questions you can answer.

* **Review fixtures that are not yet merged**  
  These are the steps that take the longest when reviewing a fixture:

  > 1. Checking whether at least 3 links are present. Otherwise, finding suitable links.
  >     - link to a manual PDF containing all DMX modes
  >     - link to a product page on the official manufacturer website
  >     - link to a YouTube or Vimeo video that showcases or explains the fixture
  > 2. Checking whether all DMX modes from the manual are included in the fixture definition.  
  > 3. Checking whether all DMX modes' channels from the manual are included in the fixture definition.  
  > 4. Checking whether all DMX channels' capabilities from the manual are included in the fixture definition.

  If you could go through some [PRs with the `new-fixture` label](https://github.com/OpenLightingProject/open-fixture-library/pulls?q=is%3Apr+is%3Aopen+label%3Anew-fixture) and comment on them with the results of those checks, that would help immensely. Thank you already :)

  For the fixtures passing these tests, these are some common tasks that often need to be fixed:

  - replace capability type `StrobeSpeed` with `ShutterStrobe` where that one fits better
  - replace capability type `Generic` with `Maintenance` where that one fits better
  - rename modes that have no name in the manual to the usual `5-channel`/`5ch` format
  - link to an English manual / product page (if one exists) instead of one in another language

  Pull requests with these fixes against the original fixture pull requests (see e.g. [#2023](https://github.com/OpenLightingProject/open-fixture-library/pull/2023)) are highly appreciated!

* **Add links and colors to existing fixtures**  
  See [#578](https://github.com/OpenLightingProject/open-fixture-library/issues/578) and [#723](https://github.com/OpenLightingProject/open-fixture-library/issues/723). There are also some broken links (see [#999](https://github.com/OpenLightingProject/open-fixture-library/issues/999)), maybe you can find some alternative links to replace them.

### Code

* **Work on easy issues**  
  Browse the [`good-first-issues` label](https://github.com/OpenLightingProject/open-fixture-library/issues?q=is:open+is:issue+label:%22good+first+issue%22) to find some easy tasks.

* **Implement your own idea**  
  Please create a new issue first if it's a bigger change.

* **Create new import/export plugins**  
  This is a bit more involved. See the [list of new plugins](https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aissue+is%3Aopen+label%3Anew-plugin) for inspiration. Use existing plugins as reference and look at the [plugin documentation](plugins.md).

* **Improve the [documentation](README.md)**  
  Especially after you have made other changes, there is likely something you've been missing in the documentation. Help others find it there!

## Local installation

After [forking](https://help.github.com/articles/fork-a-repo/) the repository, follow the [GitHub flow](https://guides.github.com/introduction/flow/) to implement your changes.

You can also create a (draft) pull request if you're not done yet to involve the reviewers into the development process and get help if you're stuck.

See [README.md](README.md#local-installation) for how to setup and test run the code locally.

## Code style

We always aim to have clear, readable code. So please try to respect these principles:

* Document every new function with [JSDoc](https://jsdoc.app/about-getting-started.html)
* Use [self-describing variable names](https://wiki.c2.com/?GoodVariableNames) and prefer constant variables over literal values without explanation
* Prefer code readability over [micro-optimisation](https://softwareengineering.stackexchange.com/questions/99445/is-micro-optimisation-important-when-coding)
* Use JavaScript features that improve code readability, for example:
  - Prefer [Array iteration methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Instance_methods) (like [`map(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [`filter(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), [`some(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some), [`every(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every), [`find(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)) with arrow functions over loops
  - Always use [template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) (backticks instead of single or double quotes: ``const str = `My name is ${name}.`;``) as [they are strictly better strings](https://ponyfoo.com/articles/template-literals-strictly-better-strings) and make string concatenation (`const str = 'My name is ' + name + '.';`) more readable
* Try to make a piece of code not too complex. That is, if a function contains lots of ifs and for-loops, extract some parts into helper functions. (For example, the `checkFixture()` function calls `checkPhysical()` and `checkChannels()`, `checkChannel()` calls `checkCapabilities()`, etc.)

We automatically check code style using [ESLint](https://eslint.org/). Maybe your IDE supports ESLint highlighting (there's a good [extension for VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)) – this helps spotting bad code style as quickly as possible.

## Developer tips

* To understand how OFL works, read the [Documentation Overview](README.md) and its related pages. We try to document every part of our software.
* Run [tests](testing.md) in the `tests/` directory locally before pushing – that's faster than waiting for the automated GitHub Actions tests in pull requests.
* Run `npm run build` to be sure that auto-generated contents are up-to-date.
