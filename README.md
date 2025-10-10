# Open Fixture Library  
<a href="https://open-fixture-library.org/">open-fixture-library.org</a>

[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade-score/open-fixture-library.org?publish)](https://developer.mozilla.org/en-US/observatory/analyze?host=open-fixture-library.org)
[![Beacon](https://img.shields.io/badge/dynamic/json?color=blue&label=Beacon&query=%24.co2&suffix=%20CO%E2%82%82%2Fview&url=https%3A%2F%2Fdigitalbeacon.co%2Fbadge%3Furl%3Dhttps%253A%252F%252Fopen-fixture-library.org&cacheSeconds=604800)](https://digitalbeacon.co/report/open-fixture-library-org)

[<img alt="OFL logo" src="https://cdn.rawgit.com/OpenLightingProject/open-fixture-library/master/ui/static/ofl-logo.svg" width="250" />](ui/static/ofl-logo.svg)

To use lighting control software like [QLC+](https://www.qlcplus.org/), [DMXControl](https://www.dmxcontrol.org/) or [e:cue](https://www.osram.de/ecue/), you need fixture definition files that describe your lighting hardware. Since one software can usually only understand its own fixture definition format, switching between different programs can be difficult.

The *Open Fixture Library* tries to solve this problem by collecting fixture definitions and making them downloadable in various formats. Internally, it uses a [JSON format](docs/fixture-format.md) that tries to bundle as much information as possible for all the different output formats.

## Getting Started (Development)

If you want to run the project locally and contribute code, docs, or review fixtures, follow these quick steps.

> **Requirements**
> - Node.js **18** or later
> - npm (bundled with Node) — or use your preferred package manager

```bash
# 1) Clone your fork of the repository (replace <your-username>)
git clone https://github.com/<your-username>/open-fixture-library.git
cd open-fixture-library

# 2) Install dependencies
npm install

# 3) Start the development site (Nuxt)
npm run dev

# 4) Run tests
npm test
```
If you are working with Docker or the backend tooling, check the project docs/README.md and docs/CONTRIBUTING.md for additional environment-specific instructions.

For additional developer information (project structure, fixtures, and tools), see the Developer Documentation.

Contribute without coding
The easiest way to help: Head over to the online Fixture Editor and add your favorite fixture that is not yet included in our library!

There are also other ways you can help without coding.

🙏 Help wanted! There are a lot of pull requests for new fixtures that are not yet reviewed and merged. Reviewing them (and maybe fixing smaller issues) helps get this number down and the number of fixtures in OFL up! See the step-by-step instructions for fixture reviews.

Contribute code
See CONTRIBUTING.md and our Developer Documentation.
---
