import { rules as stylisticRules } from '@stylistic/stylelint-config';
import { defineStylistic } from '@stylistic/stylelint-plugin';

const stylisticCssRules = defineStylistic({ rules: stylisticRules });

const vueScssRules = {
  ...Object.fromEntries(Object.keys(stylisticCssRules)
    .map((ruleName) => [ruleName, null])),
  ...defineStylistic({ syntax: 'scss', rules: stylisticRules }),
  '@stylistic/scss/block-closing-brace-newline-after': ['always', { ignoreAtRules: ['if', 'else'] }],
  '@stylistic/scss/value-list-max-empty-lines': 1,
};

export default {
  extends: ['./.stylelintrc.yaml'],
  overrides: [
    {
      files: ['**/*.vue'],
      rules: vueScssRules,
    },
  ],
};
