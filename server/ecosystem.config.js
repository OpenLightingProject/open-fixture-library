// pm2 is expected to be installed globally

/* eslint-disable quotes, camelcase */

const secrets = require("./ofl-secrets.json");

const envVariablesOfl = {
  "ALLOW_SEARCH_INDEXING": "allowed",
  "GITHUB_USER_TOKEN": secrets.OFL_GITHUB_USER_TOKEN,
  "NODE_ENV": "production",
  "PORT": "5000"
};

const envVariablesEmbetty = {
  "PORT": "6977",
  "VALID_ORIGINS": "*" // access control is implemented in nginx reverse proxy
};

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "ofl",
      script: "main.js",
      cwd: "/home/flo/open-fixture-library/current",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      instances: 2,
      exec_mode: "cluster",
      env: envVariablesOfl
    },
    {
      name: "webhook",
      script: "webhook.js",
      cwd: "/home/flo",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    },
    {
      name: "embetty",
      script: "./node_modules/@heise/embetty-server/bin/embetty-start",
      cwd: "/home/flo/open-fixture-library/current",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: envVariablesEmbetty
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    "ofl-production": {
      user: "flo",
      host: "localhost",
      ref: "origin/master",
      repo: "git@github.com:OpenLightingProject/open-fixture-library.git",
      path: "/home/flo/open-fixture-library",
      "post-deploy": "npm install && (if [ -e server ]; then cp ./server/* /home/flo; fi) && pm2 reload /home/flo/ecosystem.config.js",
      env: envVariablesOfl,

      // used in webhook.js
      _webhook_port: 40010,
      _webhook_path: "/",
      _webhook_secret: secrets.OFL_WEBHOOK_SECRET
    }
  }
};
