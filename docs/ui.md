# User Interface (UI) / Website

We run our [website](https://open-fixture-library.herokuapp.com/) with an [Express](http://expressjs.com/) server. Initialization and routing is done in [`main.js`](../main.js). Running `npm run watch` starts the server by calling the main script and reloads it when dependent files (e.g. fixtures, UI scripts) change.

Visit `http://localhost:5000/` to see the local server running. The port 5000 can be changed with the environment variable `PORT`.

The main script binds different kinds of content into the website:

* **Static resources**  
  The complete [`static/`](../static/) directory is mirrored into the site's root directory. We mainly use it for icons and fonts.
* **Dynamic html pages**  
  Each subpage is implemented as a separate JavaScript module in [`views/pages/`](../views/pages/). These modules can include reusable components (such as header and footer) which are located in [`views/includes/`](../views/includes/).
* **Client-side JavaScripts**  
  JavaScript files for the clients' browsers are located in [`views/scripts/`](../views/scripts/) and are bundled with [Browserify](http://browserify.org/). This allows us to still use `require('npm-module')`.
* **SCSS stylesheets**  
  We use the [SCSS](http://sass-lang.com/) preprocessor as it extends basic CSS syntax with convenient utilities (such as rule nesting and variables). The SCSS files in [`views/stylesheets/`](../views/stylesheets/) are automatically bundled into a single `style.css` file that is moved into the `static/` directory afterwards.

We use [Heroku](https://www.heroku.com/) (configurable with [`app.json`](../app.json) and [`Procfile`](../Procfile)) for automatic deployment:

* The **master branch** is deployed to <https://open-fixture-library.herokuapp.com/>. It is refreshed with each commit to master, but only after the [Travis tests](testing.md) for the commits have passed.
* Each **pull request** #xyz (e.g. [#223](https://github.com/FloEdelmann/open-fixture-library/pull/223)) is deployed to `https://open-fixture-library-pr-xyz.herokuapp.com/`. It is refreshed with each commit to the feature branch without waiting for any tests to pass.

## Browser compatibility

OFL supports recent versions of all major browsers, i.e.:

- Firefox, Chrome, Edge, Safari, Opera: the 3 newest major releases each
- Internet Explorer 11

Have a look at [caniuse.com](https://caniuse.com) to see with which browser versions a JS, CSS or HTML feature works.