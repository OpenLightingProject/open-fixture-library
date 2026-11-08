/**
 * @fileoverview disallow `this` in `asyncData`
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 * Note: The `fetch` hook allows `this` since Nuxt 2.12.0, so only `asyncData` is checked.
 */

import { executeOnVue, getFunctionWithName } from './utilities.js';

const DEFAULT_HOOKS = new Set(['asyncData']);

export default {
  meta: {
    docs: {
      description: 'disallow `this` in `asyncData`',
    },
    messages: {
      noThis: 'Unexpected this in {{funcName}}.',
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
    const forbiddenNodes = new Map();
    const options = context.options[0] ?? {};
    const HOOKS = new Set([...DEFAULT_HOOKS, ...(options.methods ?? [])]);

    let nodeUsingThis = [];

    /** @returns {void} */
    function enterFunction() {
      nodeUsingThis = [];
    }

    /**
     * @param {Readonly<object>} node - The function node being exited.
     * @returns {void}
     */
    function exitFunction(node) {
      if (nodeUsingThis.length > 0) {
        forbiddenNodes.set(node, nodeUsingThis);
      }
    }

    /**
     * @param {Readonly<object>} node - The this/super expression node.
     * @returns {void}
     */
    function markThisUsed(node) {
      nodeUsingThis.push(node);
    }

    return {
      'FunctionExpression': enterFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression': enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      'ThisExpression': markThisUsed,
      'Super': markThisUsed,
      ...executeOnVue(context, (object) => {
        for (const functionName of HOOKS) {
          const property = getFunctionWithName(object, functionName);
          if (property && forbiddenNodes.has(property.value)) {
            for (const node of forbiddenNodes.get(property.value)) {
              context.report({
                node,
                messageId: 'noThis',
                data: { funcName: functionName },
              });
            }
          }
        }
      }),
    };
  },
};
