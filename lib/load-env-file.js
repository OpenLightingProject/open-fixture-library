const path = require(`path`);
const env = require(`node-env-file`);

const envFile = path.join(__dirname, `../.env`);
env(envFile, { raise: false });
