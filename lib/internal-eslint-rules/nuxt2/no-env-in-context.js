/**
 * @fileoverview disallow `context.isServer/context.isClient` in `asyncData/fetch/nuxtServerInit`
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import { executeOnVue, getFunctionWithName, isInFunction } from './utilities.js';

const ENV = new Set(['isServer', 'isClient']);
const DEFAULT_HOOKS = new Set(['asyncData', 'fetch']);

export default {
  meta: {
    docs: {
      description: 'disallow `context.isServer/context.isClient` in `asyncData/fetch/nuxtServerInit`',
    },
    messages: {
      noEnv: 'Unexpected {{env}} in {{funcName}}.',
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
        const propertyName = node.computed ? node.property.value : node.property.name;
        if (propertyName && ENV.has(propertyName)) {
          forbiddenNodes.push({ name: propertyName, node });
        }
      },
      ...executeOnVue(context, (object) => {
        for (const functionName of HOOKS) {
          const function_ = getFunctionWithName(object, functionName);
          const parameter = function_?.value ? function_.value.params?.[0] : false;
          if (parameter) {
            if (parameter.type === 'ObjectPattern') {
              for (const property of parameter.properties) {
                if (property.key?.name && ENV.has(property.key.name)) {
                  context.report({
                    node: property,
                    messageId: 'noEnv',
                    data: { env: property.key.name, funcName: functionName },
                  });
                }
              }
            }
            else {
              for (const { name, node: child } of forbiddenNodes) {
                if (isInFunction(function_, child) && parameter.name === child.object.name) {
                  context.report({
                    node: child,
                    messageId: 'noEnv',
                    data: { env: name, funcName: functionName },
                  });
                }
              }
            }
          }
        }
      }),
    };
  },
};
