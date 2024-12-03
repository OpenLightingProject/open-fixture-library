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


## Deployment

Every time a new pull request is merged into the master branch, the new version is automatically deployed to <https://open-fixture-library.org/> (see the [`server/` directory](../server/)).
