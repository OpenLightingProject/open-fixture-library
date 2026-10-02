/**
 * @fileoverview enforce component's head property to be a function
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import { executeOnVueComponent, getFirstAndLastTokens } from './utilities.js';

export default {
  meta: {
    docs: {
      description: 'enforce component\'s head property to be a function',
    },
    fixable: 'code',
    messages: {
      head: '`head` property in component must be a function.',
    },
    type: 'suggestion',
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return executeOnVueComponent(context, (object) => {
      for (const p of object.properties) {
        if (
          p.type === 'Property'
          && p.key.type === 'Identifier'
          && p.key.name === 'head'
          && p.value.type !== 'FunctionExpression'
          && p.value.type !== 'ArrowFunctionExpression'
          && p.value.type !== 'Identifier'
          && p.value.type !== 'CallExpression'
        ) {
          context.report({
            node: p,
            messageId: 'head',
            fix(fixer) {
              const tokens = getFirstAndLastTokens(sourceCode, p.value);

              return [
                fixer.insertTextBefore(tokens.first, 'function() {\nreturn '),
                fixer.insertTextAfter(tokens.last, ';\n}'),
              ];
            },
          });
        }
      }
    });
  },
};
