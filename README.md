# Open Fixture Library<br><a href="https://open-fixture-library.org/">open-fixture-library.org</a>

[![Code Quality](https://api.codacy.com/project/badge/Grade/73096865e9f44a7bb246a318ffc8e68b)](https://www.codacy.com/app/FloEdelmann/open-fixture-library)
[![David Dependency Manager](https://img.shields.io/david/OpenLightingProject/open-fixture-library.svg)](https://david-dm.org/OpenLightingProject/open-fixture-library)
[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade-score/open-fixture-library.org?publish)](https://observatory.mozilla.org/analyze/open-fixture-library.org)
[![Website Carbon](https://img.shields.io/badge/dynamic/json?color=yellowgreen&label=Website%20Carbon&query=%24.c&suffix=g%20CO%E2%82%82%2Fview&url=https%3A%2F%2Fapi.websitecarbon.com%2Fb%3Furl%3Dopen-fixture-library.org&cacheSeconds=604800)](https://www.websitecarbon.com/website/open-fixture-library-org/)

[<img alt="OFL logo" src="https://cdn.rawgit.com/OpenLightingProject/open-fixture-library/master/ui/static/ofl-logo.svg" width="250" />](ui/static/ofl-logo.svg)

To use lighting control software like [QLC+](https://www.qlcplus.org/), [DMXControl](https://www.dmxcontrol.org/) or [e:cue](https://www.osram.de/ecue/), you need fixture definition files that describe your lighting hardware. Since one software can usually only understand its own fixture definition format, switching between different programs can be difficult.

The *Open Fixture Library* tries to solve this problem by collecting fixture definitions and making them downloadable in various formats. Internally, it uses a [JSON format](docs/fixture-format.md) that tries to bundle as much information as possible for all the different output formats.


## Contribute without coding

The easiest way to help: Head over to the online [Fixture Editor](https://open-fixture-library.org/fixture-editor) and add your favorite fixture that is not yet included in our library!

Other ways you can help without coding:

* Answer questions in existing fixtures
* Review fixtures that are not yet merged *(this is highly appreciated!)*
* Add links and colors to existing fixtures

See [CONTRIBUTING.md](docs/CONTRIBUTING.md#how-you-can-help) for details.


## Contribute with coding

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) and our [Developer Documentation](docs/README.md).
