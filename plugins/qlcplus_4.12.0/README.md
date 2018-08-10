# QLC+ v4.12.0 plugin

<https://www.qlcplus.org/>

A feature-rich open-source lighting software. This plugin works with QLC+ version 4.11.3 GIT and above, but is especially useful for version 5 (alpha). None of those are released as a stable version yet, so this plugin might change as well.

The main library is available in their [GitHub repository](https://github.com/mcallegari/qlcplus/tree/master/resources/fixtures). Many additional fixtures can be found in the [forum](https://www.qlcplus.org/forum/viewforum.php?f=3). To create a new fixture, the `Fixture Editor` program is also included.

To import a fixture into *QLC+*, copy the `.qxf` file into the right directory (see below).

**File locations:**

Fixtures are always located in the `fixtures` subdirectory in one of the following paths. Fixtures in subdirectories of `fixtures` (e.g. grouped by manufacturer) aren't recognized!

|         | Main Library                                | User Library                          |
|---------|---------------------------------------------|---------------------------------------|
| Linux   | `/usr/share/qlcplus`                        | `~/.qlcplus`                          |
| Mac     | `/Applications/QLC+.app/Contents/Resources` | `~/Library/Application\ Support/QLC+` |
| Windows | `C:\QLC+`                                   | `C:\Users\MyUser\QLC+`                |
