/**
 * @fileoverview disallow `setTimeout/setInterval` in `asyncData/fetch`
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import { executeOnVue, getFunctionWithChild } from './utilities.js';

const DEFAULT_HOOKS = new Set(['fetch', 'asyncData']);
const TIMING = new Set(['setTimeout', 'setInterval']);

export default {
  meta: {
    docs: {
      description: 'disallow `setTimeout/setInterval` in `asyncData/fetch`',
    },
    messages: {
      noTiming: 'Unexpected {{name}} in {{funcName}}.',
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
      CallExpression(node) {
        if (node.callee && TIMING.has(node.callee.name)) {
          forbiddenNodes.push({ name: node.callee.name, node });
        }
      },
      VariableDeclarator(node) {
        if (node.init && TIMING.has(node.init.name)) {
          forbiddenNodes.push({ name: node.init.name, node });
        }
      },
      ...executeOnVue(context, (object) => {
        for (const { funcName, name, node } of getFunctionWithChild(object, HOOKS, forbiddenNodes)) {
          context.report({
            node,
            messageId: 'noTiming',
            data: { name, funcName },
          });
        }
      }),
    };
  },
};
