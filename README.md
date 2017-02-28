# Open Fixture Library [![Build Status](https://travis-ci.org/FloEdelmann/open-fixture-library.svg?branch=master)](https://travis-ci.org/FloEdelmann/open-fixture-library)

This is still in a very, very early stage. But you can still see the current deployed status at [open-fixture-library.herokuapp.com](https://open-fixture-library.herokuapp.com/).

## Contribute

Pushing to the `master` branch here on GitHub deploys a new version each time. So we have to make sure that the `master` branch is always clean and ready to deploy. Thus, we will make heavy use of pull requests (so, do always create feature branches `git checkout -b new-feature`) and let [Travis CI](https://travis-ci.org/FloEdelmann/open-fixture-library) check that everything new is passing all tests.

Every contribution is welcome, even in this early stage!

### Local installation

1. Clone this repository (or a fork of it).
2. Run `npm install` after first cloning or every time new dependencies are added in [package.json](package.json) in order to install the needed Node dependencies. (You can identify missing dependencies when the error "Cannot find module" is given.)
3. To start the server locally at [localhost:5000](http://localhost:5000/), run `node main.js` (or `heroku local`, which lets you use environment variables in the `.env` file).
