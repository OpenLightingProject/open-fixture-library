# Open Fixture Library [![Build Status](https://img.shields.io/travis/FloEdelmann/open-fixture-library.svg?label=tests)](https://travis-ci.org/FloEdelmann/open-fixture-library) [![Codacy Badge](https://img.shields.io/codacy/grade/73096865e9f44a7bb246a318ffc8e68b.svg)](https://www.codacy.com/app/FloEdelmann/open-fixture-library) [![Dependencies](https://img.shields.io/david/FloEdelmann/open-fixture-library.svg)](https://david-dm.org/FloEdelmann/open-fixture-library)

<img alt="OFL logo" src="https://cdn.rawgit.com/FloEdelmann/open-fixture-library/04aad444/static/ofl-logo.svg" width="250" />

To use lighting control software like [QLC+](http://www.qlcplus.org/), [DMXControl](https://www.dmxcontrol.org/) or [e:cue](http://www.ecue.de/), you need fixture definition files that describe your lighting hardware. Since one software can usually only understand its own fixture definition format, switching between different programs can be difficult.

The *Open Fixture Library* ([open-fixture-library.herokuapp.com](https://open-fixture-library.herokuapp.com/)) tries to solve this problem by collecting fixture definitions and making them downloadable in various formats. Internally, it uses a [JSON format](fixtures/schema.js) that tries to bundle as much information as possible for the different output formats.


## Contribute

The project is still in a very early stage, but we're happy to see new issues or pull requests anyway!

Pushing to the `master` branch here on GitHub deploys a new version on [Heroku](http://heroku.com/) each time. So we have to make sure that the `master` branch is always clean and ready to deploy. Thus, we will make heavy use of pull requests (so, do always create feature branches `git checkout -b new-feature`) and let [Travis CI](https://travis-ci.org/FloEdelmann/open-fixture-library) check that everything new is passing all tests.


### Local installation

1. Clone this repository (or a fork of it).
2. Run `npm install` after first cloning or every time new dependencies are added in [package.json](package.json) in order to install the needed Node dependencies. (You can identify missing dependencies when the error "Cannot find module" is given.)
3. To start the server locally at [localhost:5000](http://localhost:5000/), run `npm start` or `npm run watch` (to restart the server everytime a file is changed).


### New fixtures

Ideally, just use the [Fixture Editor](https://open-fixture-library.herokuapp.com/fixture-editor) and submit it from there (however, some features are still missing, see [#77](https://github.com/FloEdelmann/open-fixture-library/issues/77)). Please try to include as much information as possible!

If you have to manually edit fixtures, see [schema.js](fixtures/schema.js) and [defaults.js](fixtures/defaults.js) in the `fixtures` directory and use the existing fixtures as a reference.

You can also import existing fixture definitions using import plugins. See [cli/import-fixture.js](cli/import-fixture.js) for that. In the future, this will be integrated into the Fixture Editor.


### Plugins

A plugin is a module that handles import from and/or export to a fixture format. Just add a new file to the `plugins` directory, it will be automatically detected. If your plugin does not support both import and export, just define one of the functions.

```js
module.exports.name = 'e:cue';     // display name, required
module.exports.version = '0.1.0';  // plugin version, required

// optional
module.exports.export = function exportPluginName(library, options) {
  /*
   * library: array of {
   *                     manufacturerKey: '...',
   *                     fixtureKey: '...'
   *                   } objects
   * 
   * options: {
   *            manufacturers: {...},
   *            baseDir: '...',
   *            // maybe more
   *          }
   */

  let outfiles = [];

  // ...

  // multiple files will automatically be zipped together
  outfiles.push({
    name: 'filename.ext',
    content: 'file content',
    mimetype: 'text/plain'
  });

  // ...

  return outfiles;
};

// also optional
module.exports.import = function importPluginName(str, filename, resolve, reject) {
  /*
   * str:      'import file contents'
   * filename: 'importFilename.ext'
   * resolve:  function to call if everything goes right, see below
   * reject:   function to call if something goes wrong, see below
   */

  let out = {
    manufacturers: {},  // like in manufacturers.json
    fixtures: {},       // key: 'manufacturer-key/fixture-key', value: like in a fixture JSON
    warnings: {}        // key: 'manufacturer-key/fixture-key' to which a warning belongs, value: string
  };

  // ...

  // example
  const manKey = 'cameo';
  const fixKey = 'thunder-wash-600-rgb'

  if (couldNotParse) {
    return reject(`Could not parse '${filename}'.`);
  }

  // Add warning if a necessary property is not included in parsed file
  out.warnings[manKey + '/' + fixKey].push('Please specify categories.');

  out.fixtures[manKey + '/' + fixKey] = fixtureObject;

  resolve(out);
};
```

You can try import plugins by running `node cli/import-fixture.js [pluginName] [importFileName]`.


### UI

Static files are located in the `static` directory (surprise!), the dynamic stuff is in `views`.

The `views/stylesheets` subfolder contains the SASS stylesheets. Try to keep them organized, feel free to add a new file if needed.

We use [Express](http://expressjs.com/) to handle and delegate web requests to the respective page modules. Those templates reside in the `views/pages` subdirectory. A template module has to export a single function that returns a string which will be treated as HTML. The function receives a single `options` parameter. See [main.js](main.js#L32) for the guaranteed options.


### Tests

Every time a new commit is pushed to GitHub, [Travis CI](https://travis-ci.org/FloEdelmann/open-fixture-library) runs all the tests in the `tests` directory (configured by [.travis.yml](.travis.yml)). That helps spotting bugs early.

We want to ensure good code style and fixture validity, so if you have an idea for a new test or on how to improve an existing one – awesome!
