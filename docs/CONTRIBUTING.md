# Contributing Guidelines

We believe in the power of open source development and want to encourage everyone to contribute to this project. This document should help new developers and documents our coding workflow. If there are any questions left, don't hesitate to [open a new issue](https://github.com/FloEdelmann/open-fixture-library/issues/new) explaining that you haven't found the information in the docs.

## Developer vibes

Please keep being friendly and don't troll. See our [Code of Conduct](CODE_OF_CONDUCT.md) for more information on this.

## Issues

You have an idea about a new feature or you spotted a mistake? Feel free to create an [issue](https://github.com/FloEdelmann/open-fixture-library/issues) in which you describe the problem / the feature requirements. Please try to find similar issues first though, and add your information there to keep it organized.

As soon as an issue is assigned to somebody, it means that this person is responsible for fixing it.

## Local installation

1. Install [npm](https://www.npmjs.com/get-npm)
2. [Clone](https://help.github.com/articles/cloning-a-repository/) the repository
3. Navigate into your clone's directory (probably `open-fixture-library/`)
4. Run `npm install`

Now, everything's installed and should be working. To start the website server at [`http://localhost:5000/`](http://localhost:5000/), run `npm run watch` (see [UI docs](ui.md)).

## Where you can help

* Add new fixtures (either via the Fixture Editor or by manually writing a [fixture format JSON](fixture-format.md))
* Browse the [`good-first-issues` tag](https://github.com/FloEdelmann/open-fixture-library/issues?q=is:open+is:issue+label:%22good+first+issue%22) to find some easy tasks
* Improve the [documentation](README.md)
* Add new [plugins](https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Anew-plugin) (use existing ones as reference and look at the [plugin documentation](plugins.md))
* Implement your own idea (please create a new issue first if it's no bugfix or very minor change)

## Workflow: How to implement a feature

1. [Fork](https://help.github.com/articles/fork-a-repo/) the repository
2. Setup your local installation (see above) with your fork
3. [Create a new branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository/) for your feature
4. Do the needed changes, commit and push them
5. Create a [pull request](https://github.com/FloEdelmann/open-fixture-library/compare) to merge your changes back into our project

You can also create the pull request if you're not done yet to involve the reviewers into the development process and get help if you're stuck. Please include *WIP* (work in progress) in the pull request title in this case.

## Code style

We always aim to have clear, readable code. So please try to respect these principles:

* Document every new function with [JSDoc](http://usejsdoc.org/about-getting-started.html)
  - Prefix each type with either `!` (non-null) or `?` (nullable) so the null-case is always annotated
  - Be careful with arrays: Prefer the `!Array.<string>` syntax over `!string[]`
* Use [self-describing variable names](http://wiki.c2.com/?GoodVariableNames) and prefer constant variables over literal values without explanation
* Prefer code readability over [micro-optimisation](https://softwareengineering.stackexchange.com/questions/99445/is-micro-optimisation-important-when-coding)
* Use new [ES2015 (ES6)](https://babeljs.io/learn-es2015/) features that improve code readability, for example:
  - Prefer [Array iteration methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype#Iteration_methods) (like [`map(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [`filter(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), [`some(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some), [`every(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every), [`find(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)) with arrow functions over loops
  - Always use [template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) (backticks instead of single or double quotes: ``const str = `My name is ${name}.`;``) as [they are strictly better strings](https://ponyfoo.com/articles/template-literals-strictly-better-strings) and make string concatenation (`const str = 'My name is ' + name + '.';`) more readable
  - Use [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) where possible, [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) in all other cases
  - ⚠️ When developing on frontend, not all of these features can be used in order to respect [browser compatibility](./ui.md#browser-compatibility)
* Try to make a piece of code not too complex. That is, if a function contains lots of ifs and for-loops, extract some parts into helper functions. (For example, the `checkFixture()` function calls `checkPhysical()` and `checkChannels()`, `checkChannel()` calls `checkCapabilities()`, etc.)

We automatically check code style using [ESLint](https://eslint.org/). Maybe your IDE supports ESLint highlighting (there's a good [extension for VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)) – this helps spotting bad code style as quickly as possible.

## Developer tips

* To understand how OFL works, read the [Documentation Overview](README.md) and its related pages. We try to document every part of our software.
* Run [tests](testing.md) in the `tests/` directory manually – that's way faster than waiting for the automated Travis tests in pull requests.
* Run `make` to be sure that auto-generated contents are up-to-date.
