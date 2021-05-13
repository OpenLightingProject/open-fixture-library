import env from 'node-env-file';
import { fileURLToPath } from 'url';

const envFilePath = fileURLToPath(new URL(`../.env`, import.meta.url));
env(envFilePath, { raise: false });
