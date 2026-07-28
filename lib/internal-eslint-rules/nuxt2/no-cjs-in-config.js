/**
 * @fileoverview Disallow `require/module.exports/exports` in `nuxt.config.js`
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import path from 'path';

export default {
  meta: {
    docs: {
      description: 'disallow CommonJS module API `require/module.exports/exports` in `nuxt.config.js`',
    },
    messages: {
      noCjs: 'Unexpected {{cjs}}, please use {{esm}} instead.',
    },
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          file: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const configFile = options.file ?? 'nuxt.config.js';
    let isNuxtConfig = false;

    return {
      Program() {
        const filename = path.basename(context.filename);
        if (filename === configFile) {
          isNuxtConfig = true;
        }
      },
      MemberExpression(node) {
        if (!isNuxtConfig) {
          return;
        }

        if (node.object.name === 'module' && node.property.name === 'exports') {
          context.report({
            node,
            messageId: 'noCjs',
            data: { cjs: 'module.exports', esm: 'export default' },
          });
        }

        if (node.object.name === 'exports') {
          const isInScope = context.sourceCode.getScope(node).variables
            .some((variable) => variable.name === 'exports');
          if (!isInScope) {
            context.report({
              node,
              messageId: 'noCjs',
              data: { cjs: 'exports', esm: 'export default' },
            });
          }
        }
      },
      CallExpression(call) {
        const module = call.arguments[0];

        if (
          !isNuxtConfig
          || context.sourceCode.getScope(call).type !== 'module'
          || !['ExpressionStatement', 'VariableDeclarator'].includes(call.parent.type)
          || call.callee.type !== 'Identifier'
          || call.callee.name !== 'require'
          || call.arguments.length !== 1
          || module.type !== 'Literal'
          || typeof module.value !== 'string'
        ) {
          return;
        }

        context.report({
          node: call.callee,
          messageId: 'noCjs',
          data: { cjs: 'require', esm: 'import' },
        });
      },
    };
  },
};
