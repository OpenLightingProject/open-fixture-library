/**
 * Internal ESLint plugin providing Nuxt 2 rules.
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import noCjsInConfig from './no-cjs-in-config.js';
import noEnvInContext from './no-env-in-context.js';
import noEnvInHooks from './no-env-in-hooks.js';
import noGlobalsInCreated from './no-globals-in-created.js';
import noThisInFetchData from './no-this-in-fetch-data.js';
import noTimingInFetchData from './no-timing-in-fetch-data.js';
import requireFunctionHead from './require-function-head.js';

const plugin = {
  rules: {
    'no-cjs-in-config': noCjsInConfig,
    'no-env-in-context': noEnvInContext,
    'no-env-in-hooks': noEnvInHooks,
    'no-globals-in-created': noGlobalsInCreated,
    'no-this-in-fetch-data': noThisInFetchData,
    'no-timing-in-fetch-data': noTimingInFetchData,
    'require-func-head': requireFunctionHead,
  },
  configs: {},
};

const baseRules = {
  'nuxt2/no-cjs-in-config': 'error',
  'nuxt2/no-env-in-context': 'error',
  'nuxt2/no-env-in-hooks': 'error',
  'nuxt2/no-globals-in-created': 'error',
  'nuxt2/no-this-in-fetch-data': 'error',
};

const files = ['**/*.{js,vue}'];

Object.assign(plugin.configs, {
  base: {
    files,
    plugins: { nuxt2: plugin },
    rules: baseRules,
  },
  recommended: {
    files,
    plugins: { nuxt2: plugin },
    rules: {
      ...baseRules,
      'nuxt2/no-timing-in-fetch-data': 'error',
    },
  },
  all: {
    files,
    plugins: { nuxt2: plugin },
    rules: {
      ...baseRules,
      'nuxt2/no-timing-in-fetch-data': 'error',
      'nuxt2/require-func-head': 'error',
    },
  },
});

export default plugin;
