/** @import * as eslint from 'eslint'; */
/** @import { AST } from 'jsonc-eslint-parser'; */

/** @type {eslint.Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'Require specific formatting for specific array properties in fixture JSON files.',
    },
    schema: [],
    messages: {
      shouldBeSingleLine: 'Array "{{key}}" should be on a single line.',
      shouldBeMultiLine: 'Array "{{key}}" should not be on a single line.',
    },
  },
  create(context) {
    const numberArrayKeys = new Set(['dmxRange', 'range', 'dimensions', 'spacing', 'degreesMinMax']);
    const stringArrayKeys = new Set(['categories', 'authors', 'fineChannelAliases', 'colorsStart', 'colorsEnd', 'colors']);
    const singleLineArrayKeys = numberArrayKeys.union(stringArrayKeys);

    const multiLineArrayKeys = new Set(['manual', 'productPage', 'video', 'other']);

    return {
      /** @param { AST.JSONProperty } node - JSON property AST node. */
      JSONProperty(node) {
        const keyName = node.key.value;
        const { value } = node;

        if (value.type !== 'JSONArrayExpression') {
          return;
        }

        if (
          singleLineArrayKeys.has(keyName)
          && value.loc.start.line !== value.loc.end.line
        ) {
          context.report({
            node: value,
            messageId: 'shouldBeSingleLine',
            data: { key: keyName },
            fix(fixer) {
              const elementTexts = value.elements.map((element) => context.sourceCode.getText(element));
              return fixer.replaceText(value, `[${elementTexts.join(', ')}]`);
            },
          });
        }
        else if (
          multiLineArrayKeys.has(keyName)
          && value.loc.start.line === value.loc.end.line
        ) {
          context.report({
            node: value,
            messageId: 'shouldBeMultiLine',
            data: { key: keyName },
            fix(fixer) {
              const elementTexts = value.elements.map((element) => context.sourceCode.getText(element));
              return fixer.replaceText(value, `[\n${elementTexts.join(',\n')}\n]`);
            },
          });
        }
      },
    };
  },
};
