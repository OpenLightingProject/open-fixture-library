# Open Fixture Library<br><a href="https://open-fixture-library.org/">open-fixture-library.org</a>

[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade-score/open-fixture-library.org?publish)](https://developer.mozilla.org/en-US/observatory/analyze?host=open-fixture-library.org)
[![Beacon](https://img.shields.io/badge/dynamic/json?color=blue&label=Beacon&query=%24.co2&suffix=%20CO%E2%82%82%2Fview&url=https%3A%2F%2Fdigitalbeacon.co%2Fbadge%3Furl%3Dhttps%253A%252F%252Fopen-fixture-library.org&cacheSeconds=604800)](https://digitalbeacon.co/report/open-fixture-library-org)

[<img alt="OFL logo" src="https://cdn.rawgit.com/OpenLightingProject/open-fixture-library/master/ui/static/ofl-logo.svg" width="250" />](ui/static/ofl-logo.svg)

To use lighting control software like [QLC+](https://www.qlcplus.org/), [DMXControl](https://www.dmxcontrol.org/) or [e:cue](https://www.osram.de/ecue/), you need fixture definition files that describe your lighting hardware. Since one software can usually only understand its own fixture definition format, switching between different programs can be difficult.

The *Open Fixture Library* aims to solve this problem by collecting fixture definitions and making them downloadable in various formats.
 Internally, it uses a [JSON format](docs/fixture-format.md) that tries to bundle as much information as possible for all the different output formats.


## Contribute without coding

The easiest way to help: Head over to the online [Fixture Editor](https://open-fixture-library.org/fixture-editor) and add your favorite fixture that is not yet included in our library!

There are also [other ways you can help without coding](docs/CONTRIBUTING.md#how-you-can-help).

**🙏 Help wanted!** There are [a lot of pull requests](https://github.com/OpenLightingProject/open-fixture-library/pulls?q=is%3Apr+is%3Aopen+label%3Anew-fixture+sort%3Aupdated-desc) for new fixtures that are not yet reviewed and merged. Reviewing them (and maybe fixing smaller issues) helps get this number down and the number of fixtures in OFL up! See the [step-by-step instructions for fixture reviews](docs/CONTRIBUTING.md#fixtures).


## Contribute code

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) and our [Developer Documentation](docs/README.md).
