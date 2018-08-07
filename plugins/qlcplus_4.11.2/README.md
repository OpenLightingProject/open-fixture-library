# QLC+ v4.11.2 plugin

<http://www.qlcplus.org/>

A feature-rich open-source lighting software. This plugin works with QLC+ version 4.11.2 and below.

The main library is available in their [GitHub repository](https://github.com/mcallegari/qlcplus/tree/QLC%2B_4.11.2/resources/fixtures). Many additional fixtures can be found in the [forum](http://www.qlcplus.org/forum/viewforum.php?f=3). To create a new fixture, the `Fixture Editor` program is also included.

To import a fixture into *QLC+*, copy the `.qxf` file into the right directory (see below).

### File locations

Fixtures are always located in the `fixture` subdirectory in one of the following paths. Fixtures in subdirectories of `fixture` (e.g. grouped by manufacturer) aren't recognized!

|         | Main Library                                | User Library                          |
|---------|---------------------------------------------|---------------------------------------|
| Linux   | `/usr/share/qlcplus`                        | `~/.qlcplus`                          |
| Mac     | `/Applications/QLC+.app/Contents/Resources` | `~/Library/Application\ Support/QLC+` |
| Windows | `C:\QLC+`                                   | `C:\Users\MyUser\QLC+`                |
