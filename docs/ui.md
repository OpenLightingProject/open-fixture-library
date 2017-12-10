# User Interface (UI) / Website

We run our [website](https://open-fixture-library.herokuapp.com/) with an [Express](http://expressjs.com/) server. Initialization and routing is done in [`main.js`](../main.js). Running `npm run watch` starts the server by calling the main script and reloads it when dependent files (e.g. fixtures, UI scripts) change.

Visit `http://localhost:5000/` to see the local server running. The port 5000 can be changed with the environment variable `PORT`.

The main script binds different kinds of content into the website:

- **Static resources** – the complete [`static/`](../static/) directory is mirrored into the site's root directory. We mainly use it for images and fonts.
- **Dynamic html pages** – each subpage is implemented as seperate module in [`views/pages/`](../views/pages/). These modules can include reusable components (such as header and footer) which are located in [`views/includes/`](../views/includes/).
- **Client-side JavaScripts** – they are located in [`views/scripts/`](../views/scripts/) and are bundled with [Browserify](http://browserify.org/) which lets us use `require('npm-module')` in the browser.
- **SCSS stylesheets** – we like the [SCSS](http://sass-lang.com/) preprocessor as it orients on CSS' original syntax and extends it with convenient utilities (such as rule nesting and variables). The SCSS files in [`views/stylesheets/`](../views/stylesheets/) are automatically bundled into a single `style.css` file that is moved into the `static/` directory afterwards.

We use [Heroku](https://www.heroku.com/) (configurable with [`app.json`](../app.json) and [`Procfile`](../Procfile)) for automatic deployment:

- The **master branch** is deployed to https://open-fixture-library.herokuapp.com/. It is refreshed with each commit to master, but only after the [Travis tests](testing.md) for the commits have passed.
- Each **pull request** #xyz is deployed to https://open-fixture-library-pr-xyz.herokuapp.com/. It is refreshed with each commit to the feature branch without taking account of the tests.
