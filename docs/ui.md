# User Interface (UI) / Website

Our website [open-fixture-library.org/](https://open-fixture-library.org/) is a [Nuxt](https://nuxtjs.org/) instance running on an [Express](https://expressjs.com/) server. That means that every page is a [Vue](https://vuejs.org/) component that is rendered on the server. Users that have JavaScript enabled can navigate purely on the client-side though, so only a small page-specific JavaScript file is downloaded via [XHR](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) and rendered in the browser. All that is handled automatically by Nuxt.


## Local development server

Locally, running `npm run dev` (after the [initial setup](README.md#local-installation)) starts the development server at `http://localhost:3000/` with hot module reloading, i.e. a changed Vue component file automatically patches only that component without having to reload the whole page. The port can be changed with the environment variable `PORT`, e.g. in the `.env` file.


## Folder structure

*Note: for non-UI-related folders, see [README.md](README.md).*

* `ui/`
  - `api/` – Handlers that respond to AJAX resquests from the frontend (see the [REST API reference](rest-api.md))
  - `assets/` – Icons, scripts, stylesheets, etc.
  - `components/` – Reusable Vue components
  - `express-middleware/` – Functions that directly hook into Express.js (the server side router)
  - `layouts/` – Whole-page [Nuxt layouts](https://nuxtjs.org/guide/views#layouts)
  - `pages/` – All website pages (in the [correct directory structure](https://nuxtjs.org/guide/routing)) as Vue components
  - `plugins/` – [Nuxt plugins](https://nuxtjs.org/guide/plugins) that load and instantiate external modules
  - `static/` – Resources that don't need processing before being served
* `nuxt.config.js`


## Browser compatibility

We aim to support modern browsers without having to include too much polyfills / workarounds for legacy browsers:

- Firefox, Chrome, Edge, Safari, Opera: the 3 newest major releases each
- Internet Explorer 11

Have a look at [caniuse.com](https://caniuse.com) to see with which browser versions a JS, CSS or HTML feature works.

Please stick to the [code style guidelines](CONTRIBUTING.md#code-style). If a function or syntax feature is not supported in the browsers listed above and is not transpiled by the build process automatically (just search for the function name in the JavaScript file loaded by the browser), you can include a polyfill for it in [`ui/plugins/polyfills.js`](../ui/plugins/polyfills.js).


## Deployment

Every time a new pull request is merged into the master branch, the new version is automatically deployed to <https://open-fixture-library.org/> (see the [`server/` directory](../server/)).

Each **pull request** `#xyz` (e.g. [#223](https://github.com/OpenLightingProject/open-fixture-library/pull/223)) is automatically deployed as a review app to `https://open-fixture-library-pr-xyz.herokuapp.com/` on [Heroku](https://www.heroku.com/). It is refreshed with each commit to the feature branch without waiting for any tests to pass.
