// pm2 is expected to be installed globally

const secrets = require(`./ofl-secrets.json`);

const environmentVariablesOfl = {
  'ALLOW_SEARCH_INDEXING': `allowed`,
  'GITHUB_USER_TOKEN': secrets.OFL_GITHUB_USER_TOKEN,
  'NODE_ENV': `production`,
  'PORT': `5000`,
  'WEBSITE_URL': `https://open-fixture-library.org/`,
};

const environmentVariablesEmbetty = {
  'PORT': `6977`,
  'VALID_ORIGINS': `*`, // access control is implemented in nginx reverse proxy
};

module.exports = {
  /**
   * Application configuration section
   * https://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: `ofl`,
      script: `./node_modules/nuxt/bin/nuxt.js`,
      args: `start`,
      cwd: `/home/flo/open-fixture-library`,
      'log_date_format': `YYYY-MM-DD HH:mm:ss Z`,
      env: environmentVariablesOfl,
    },
    {
      name: `webhook`,
      script: `webhook.js`,
      cwd: `/home/flo`,
      'log_date_format': `YYYY-MM-DD HH:mm:ss Z`,
    },
    {
      name: `embetty`,
      script: `./node_modules/@heise/embetty-server/bin/embetty-start`,
      cwd: `/home/flo/open-fixture-library`,
      'log_date_format': `YYYY-MM-DD HH:mm:ss Z`,
      env: environmentVariablesEmbetty,
    },
  ],
};
