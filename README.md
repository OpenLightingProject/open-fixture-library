# Open Fixture Library [![Build Status](https://travis-ci.org/FloEdelmann/open-fixture-library.svg?branch=master)](https://travis-ci.org/FloEdelmann/open-fixture-library)

<img alt="OFL logo" src="https://cdn.rawgit.com/FloEdelmann/open-fixture-library/04aad444/static/ofl-logo.svg" width="250" />

To use lighting control software like [QLC+](http://www.qlcplus.org/) or [e:cue](http://www.ecue.de/), you need proprietary fixture definition files that describe your lighting hardware. Those can be difficult to create, find or convert from one format into another.

The *Open Fixture Library* ([open-fixture-library.herokuapp.com](https://open-fixture-library.herokuapp.com/)) tries to solve those problems by collecting fixture definitions and making them downloadable in various formats.


## Contribute

The project is still in a very early stage, but we're happy to see new issues or pull requests anyway!

Pushing to the `master` branch here on GitHub deploys a new version on [Heroku](http://heroku.com/) each time. So we have to make sure that the `master` branch is always clean and ready to deploy. Thus, we will make heavy use of pull requests (so, do always create feature branches `git checkout -b new-feature`) and let [Travis CI](https://travis-ci.org/FloEdelmann/open-fixture-library) check that everything new is passing all tests.


### Local installation

1. Clone this repository (or a fork of it).
2. Run `npm install` after first cloning or every time new dependencies are added in [package.json](package.json) in order to install the needed Node dependencies. (You can identify missing dependencies when the error "Cannot find module" is given.)
3. To start the server locally at [localhost:5000](http://localhost:5000/), run `node main.js` (or `heroku local`, which lets you use environment variables in the `.env` file).


### New fixtures

See [schema.js](fixtures/schema.js) and [defaults.js](fixtures/defaults.js) in the `fixtures` directory and use the existing fixtures as a reference. Please try to include as much information as possible!

In the future, it will be possible to add fixtures via a graphical fixture editor that will also allow importing from other formats.


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

You can try import plugins by running `node cli-import.js [pluginName] [importFileName]`.


### UI

Static files are located in the `static` directory (surprise!), the dynamic stuff is in `views`.

The `views/stylesheets` subfolder contains the SASS stylesheets. Try to keep them organized, feel free to add a new file if needed.

We use [Express](http://expressjs.com/) to handle and delegate web requests to the respective page modules. Those templates reside in the `views/pages` subdirectory. A template module has to export a single function that returns a string which will be treated as HTML. The function receives a single `options` parameter. See [main.js](main.js#L32) for the guaranteed options.


### Tests

Every time a new commit is pushed to GitHub, [Travis CI](https://travis-ci.org/FloEdelmann/open-fixture-library) runs all the tests in the `tests` directory (configured by [.travis.yml](.travis.yml)). That helps spotting bugs early.

We want to ensure good code style and fixture validity, so if you have an idea for a new test or on how to improve an existing one – awesome!
