import env from 'node-env-file';

const envFilePath = new URL(`../.env`, import.meta.url).pathname;
env(envFilePath, { raise: false });
