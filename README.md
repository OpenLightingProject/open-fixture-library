# Open Fixture Library [![Build Status](https://travis-ci.org/FloEdelmann/open-fixture-library.svg?branch=master)](https://travis-ci.org/FloEdelmann/open-fixture-library)

This is still in a very, very early stage. But you can still see the current deployed status at [open-fixture-library.herokuapp.com](https://open-fixture-library.herokuapp.com/).

## Contribute

Every push to the `master` branch here on GitHub deploys a new version. So we have to make sure that the `master` branch is always clean and ready to deploy. Thus, we will make heavy use of pull requests (so, do always create feature branches `git checkout -b new-feature`) and let [Travis CI](https://travis-ci.org/FloEdelmann/open-fixture-library) check that everything new is passing all tests.

Locally, you can test every change by running `node index.js` (or `heroku local`, which lets you use environment variables in the `.env` file) and opening [localhost:5000](http://localhost:5000/).

Every contribution is welcome, even in this early stage!