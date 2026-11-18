import { rules as stylisticRules } from '@stylistic/stylelint-config';
import { defineStylistic } from '@stylistic/stylelint-plugin';

const maxEmptyLinesInSassLists = 1;

const vueScssRules = {
  ...defineStylistic({ syntax: 'scss', rules: stylisticRules }),
  '@stylistic/scss/block-closing-brace-newline-after': ['always', { ignoreAtRules: ['if', 'else'] }],
  '@stylistic/scss/value-list-max-empty-lines': maxEmptyLinesInSassLists,
};

export default {
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: true,
  reportDescriptionlessDisables: true,
  extends: [
    '@stylistic/stylelint-config',
    'stylelint-config-standard-scss',
    'stylelint-config-html/vue',
    'stylelint-config-recess-order',
  ],
  rules: {
    // `without-alpha` not supported by Sass
    'color-function-alias-notation': 'with-alpha',

    // `modern` not supported by Sass
    'color-function-notation': 'legacy',

    // always long to be consistent
    'color-hex-length': 'long',

    // always numeric to be consistent
    'font-weight-notation': 'numeric',

    // avoid using non-global functions
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: [
          'theme-color',
          'color-to-rgb-string',
          /^[a-z]+\.[a-z-]+$/, // all `@use`d Sass functions
        ],
      },
    ],

    // causes false positives with Sass
    'nesting-selector-no-missing-scoping-root': null,

    // decrease severity for this rule only
    'no-descending-specificity': [
      true,
      {
        severity: 'warning',
      },
    ],

    // allow Vue pseudo elements
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],

    // special `@if`/`@else` formatting
    '@stylistic/scss/block-closing-brace-newline-after': ['always', { ignoreAtRules: ['if', 'else'] }],

    // allow grouping in Sass lists
    '@stylistic/scss/value-list-max-empty-lines': maxEmptyLinesInSassLists,

    // simplify rules
    'scss/block-no-redundant-nesting': true,

    // prevent comments in generated CSS
    'scss/comment-no-loud': true,

    // prevent deprecated color functions
    'scss/function-color-channel': true,

    // make imported files more explicit
    'scss/load-partial-extension': 'always',
  },
  overrides: [
    {
      files: ['**/*.vue'],
      rules: vueScssRules,
    },
  ],
};
