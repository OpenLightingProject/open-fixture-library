/**
 * @fileoverview disallow process.server/process.client/process.browser in lifecycle hooks
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import { executeOnVue, getFunctionWithName, isInFunction } from './utilities.js';

const ENV = new Set(['server', 'client', 'browser']);
const DEFAULT_HOOKS = new Set([
  'beforeMount', 'mounted', 'beforeUpdate', 'updated',
  'activated', 'deactivated', 'beforeDestroy', 'destroyed',
]);

export default {
  meta: {
    docs: {
      description: 'disallow process.server and process.client in lifecycle hooks: beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy and destroyed',
    },
    messages: {
      noEnv: 'Unexpected {{name}} in {{funcName}}.',
    },
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          methods: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const forbiddenNodes = [];
    const options = context.options[0] ?? {};
    const HOOKS = new Set([...DEFAULT_HOOKS, ...(options.methods ?? [])]);

    return {
      MemberExpression(node) {
        if (node.object.name !== 'process') {
          return;
        }

        const propertyName = node.computed ? node.property.value : node.property.name;
        if (propertyName && ENV.has(propertyName)) {
          forbiddenNodes.push({ name: `process.${propertyName}`, node });
        }
      },
      ...executeOnVue(context, (object) => {
        for (const functionName of HOOKS) {
          const function_ = getFunctionWithName(object, functionName);
          if (function_) {
            for (const { name, node: child } of forbiddenNodes) {
              if (isInFunction(function_, child)) {
                context.report({
                  node: child,
                  messageId: 'noEnv',
                  data: { name, funcName: functionName },
                });
              }
            }
          }
        }
      }),
    };
  },
};
