const fs = require(`fs`);
const path = require(`path`);
const env = require(`node-env-file`);

const envFile = path.join(__dirname, `../.env`);
if (fs.existsSync(envFile)) {
  env(envFile);
}