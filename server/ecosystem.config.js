// pm2 is expected to be installed globally

/* eslint-disable quotes, camelcase */

const secrets = require("./ofl-secrets.json");

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
      env: {
        "ALLOW_SEARCH_INDEXING": "allowed",
        "GITHUB_USER_TOKEN": secrets.OFL_GITHUB_USER_TOKEN,
        "NODE_ENV": "production",
        "PORT": "5000"
      }
    },
    {
      name: "webhook",
      script: "webhook.js",
      cwd: "/home/flo",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
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
      repo: "git@github.com:FloEdelmann/open-fixture-library.git",
      path: "/home/flo/open-fixture-library",
      "post-deploy": "npm install && cp server/* /home/flo && pm2 reload /home/flo/ecosystem.config.js",
      webhook: {
        port: secrets.OFL_WEBHOOK_PORT,
        path: "/webhook",
        secret: secrets.OFL_WEBHOOK_SECRET
      }
    }
  }
};
