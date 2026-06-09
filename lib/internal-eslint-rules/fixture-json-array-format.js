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
    const allKeys = new Set([...numberArrayKeys, ...stringArrayKeys]);

    return {
      JSONProperty(node) {
        const keyName = node.key.type === 'JSONLiteral' ? node.key.value : node.key.name;

        if (!allKeys.has(keyName)) {
          return;
        }

        const { value } = node;
        if (value.type !== 'JSONArrayExpression') {
          return;
        }

        if (value.loc.start.line === value.loc.end.line) {
          return;
        }

        const { sourceCode } = context;

        context.report({
          node: value,
          messageId: 'shouldBeSingleLine',
          data: { key: keyName },
          fix(fixer) {
            const elementTexts = value.elements.map((element) => sourceCode.getText(element));
            return fixer.replaceText(value, `[${elementTexts.join(', ')}]`);
          },
        });
      },
    };
  },
};
