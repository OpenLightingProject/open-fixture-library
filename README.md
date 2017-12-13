# Open Fixture Library [![Build Status](https://img.shields.io/travis/FloEdelmann/open-fixture-library/master.svg?label=tests)](https://travis-ci.org/FloEdelmann/open-fixture-library) [![Code quality](https://img.shields.io/codacy/grade/73096865e9f44a7bb246a318ffc8e68b.svg)](https://www.codacy.com/app/FloEdelmann/open-fixture-library) [![Greenkeeper badge](https://badges.greenkeeper.io/FloEdelmann/open-fixture-library.svg)](https://greenkeeper.io/)

<img alt="OFL logo" src="https://cdn.rawgit.com/FloEdelmann/open-fixture-library/master/static/ofl-logo.svg" width="250" />

To use lighting control software like [QLC+](http://www.qlcplus.org/), [DMXControl](https://www.dmxcontrol.org/) or [e:cue](http://www.ecue.de/), you need fixture definition files that describe your lighting hardware. Since one software can usually only understand its own fixture definition format, switching between different programs can be difficult.

The *Open Fixture Library* ([open-fixture-library.herokuapp.com](https://open-fixture-library.herokuapp.com/)) tries to solve this problem by collecting fixture definitions and making them downloadable in various formats. Internally, it uses a [JSON format](docs/fixture-format.md) that tries to bundle as much information as possible for all the different output formats.


## Contribute

If you are a **user** and want to help, head over to the [Fixture Editor](https://open-fixture-library.herokuapp.com/fixture-editor) and add your favorite fixture that is not yet included in our library!

If you are a **developer**, see [CONTRIBUTING.md](docs/CONTRIBUTING.md) and our [Developer Documentation](docs/README.md).