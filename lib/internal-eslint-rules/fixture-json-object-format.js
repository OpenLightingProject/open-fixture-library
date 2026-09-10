/** @import * as eslint from 'eslint'; */
/** @import { AST } from 'jsonc-eslint-parser'; */

/** @type {eslint.Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'Require specific formatting for object properties in fixture JSON files.',
    },
    schema: [],
    messages: {
      shouldBeMultiLine: 'Object should not be on a single line.',
    },
  },
  create(context) {
    return {
      /** @param { AST.JSONObjectExpression } node - JSON property AST node. */
      JSONObjectExpression(node) {
        if (node.loc.start.line !== node.loc.end.line) {
          return;
        }

        // allow single-line pixelGroup objects
        if (
          node.parent.type === 'JSONProperty'
          && node.parent.parent.type === 'JSONObjectExpression'
          && node.parent.parent.parent.type === 'JSONProperty'
          && node.parent.parent.parent.key.value === 'pixelGroups'
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'shouldBeMultiLine',
          fix(fixer) {
            const propertyTexts = node.properties.map((property) => context.sourceCode.getText(property));
            return fixer.replaceText(node, `{\n${propertyTexts.join(',\n')}\n}`);
          },
        });
      },
    };
  },
};
