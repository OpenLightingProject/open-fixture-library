/** @import * as eslint from 'eslint'; */

/** @type {eslint.Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'Require specific array properties in fixture JSON files to be on a single line.',
    },
    schema: [],
    messages: {
      shouldBeSingleLine: 'Array "{{key}}" should be on a single line.',
    },
  },
  create(context) {
    const numberArrayKeys = new Set(['dmxRange', 'range', 'dimensions', 'spacing', 'degreesMinMax']);
    const stringArrayKeys = new Set(['categories', 'authors', 'fineChannelAliases', 'colorsStart', 'colorsEnd', 'colors']);
    const allKeys = numberArrayKeys.union(stringArrayKeys);

    return {
      JSONProperty(node) {
        const keyName = node.key.value;
        const { value } = node;

        if (
          !allKeys.has(keyName)
          || value.type !== 'JSONArrayExpression'
          || value.loc.start.line === value.loc.end.line
        ) {
          return;
        }

        context.report({
          node: value,
          messageId: 'shouldBeSingleLine',
          data: { key: keyName },
          fix(fixer) {
            const elementTexts = value.elements.map((element) => context.sourceCode.getText(element));
            return fixer.replaceText(value, `[${elementTexts.join(', ')}]`);
          },
        });
      },
    };
  },
};
