/**
 * @fileoverview disallow `window/document` in `created/beforeCreate`
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import { executeOnVue, getFunctionWithChild } from './utilities.js';

const DEFAULT_HOOKS = new Set(['created', 'beforeCreate']);
const GLOBALS = new Set(['window', 'document']);

export default {
  meta: {
    docs: {
      description: 'disallow `window/document` in `created/beforeCreate`',
    },
    messages: {
      noGlobals: 'Unexpected {{name}} in {{funcName}}.',
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
        if (node.object && GLOBALS.has(node.object.name)) {
          forbiddenNodes.push({ name: node.object.name, node });
        }
      },
      VariableDeclarator(node) {
        if (node.init && GLOBALS.has(node.init.name)) {
          forbiddenNodes.push({ name: node.init.name, node });
        }
      },
      ...executeOnVue(context, (object) => {
        for (const { funcName, name, node } of getFunctionWithChild(object, HOOKS, forbiddenNodes)) {
          context.report({
            node,
            messageId: 'noGlobals',
            data: { name, funcName },
          });
        }
      }),
    };
  },
};
