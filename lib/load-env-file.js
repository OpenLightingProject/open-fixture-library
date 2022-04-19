import { fileURLToPath } from 'url';
import env from 'node-env-file';

const envFilePath = fileURLToPath(new URL(`../.env`, import.meta.url));
env(envFilePath, { raise: false });
