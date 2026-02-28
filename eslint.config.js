import { fixupPluginRules } from '@eslint/compat';
import eslintJs from '@eslint/js';
import eslintMarkdown from '@eslint/markdown';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintPluginVitest from '@vitest/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import { configs as eslintPluginJsoncConfigs } from 'eslint-plugin-jsonc';
import eslintPluginNuxt from 'eslint-plugin-nuxt';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginSonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';

const eslintPluginNuxtConfigRecommended = {
  files: ['**/*.{js,vue}'],
  plugins: {
    nuxt: fixupPluginRules(eslintPluginNuxt),
  },
  rules: {
    ...eslintPluginNuxt.configs.base.rules,
    ...eslintPluginNuxt.configs.recommended.rules,
    'nuxt/require-func-head': 'error',
  },
};

const stylisticEslintConfig = eslintPluginStylistic.configs.customize({
  arrowParens: true,
  semi: true,
});

const enabledRuleParameters = {
  // Core ESLint rules
  'accessor-pairs': [],
  'camelcase': [],
  'consistent-return': [],
  'curly': ['all'],
  'dot-notation': [],
  'eqeqeq': ['always', { null: 'ignore' }],
  'getter-return': [],
  'grouped-accessor-pairs': ['getBeforeSet'],
  'guard-for-in': [],
  'no-array-constructor': [],
  'no-bitwise': [],
  'no-constant-binary-expression': [],
  'no-else-return': [{ allowElseIf: false }],
  'no-empty': [],
  'no-empty-function': [],
  'no-irregular-whitespace': [],
  'no-lonely-if': [],
  'no-loop-func': [],
  'no-nested-ternary': [],
  'no-object-constructor': [],
  'no-prototype-builtins': [],
  'no-restricted-imports': [{
    name: 'fs',
    message: 'Please use \'fs/promises\' instead.',
  }],
  'no-return-assign': [],
  'no-return-await': [],
  'no-shadow': [{
    builtinGlobals: false,
    allow: ['_'], // allow placeholder parameters that aren't used anyway
  }],
  'no-template-curly-in-string': [],
  'no-unsafe-optional-chaining': [{ disallowArithmeticOperators: true }],
  'no-unused-vars': [{ args: 'none' }],
  'no-useless-assignment': [],
  'no-var': [],
  'object-shorthand': [],
  'prefer-arrow-callback': [],
  'prefer-const': [{ destructuring: 'all' }],
  'prefer-object-spread': [],
  'prefer-rest-params': [],
  'prefer-template': [],
  'radix': [],

  // eslint-plugin-stylistic
  '@stylistic/curly-newline': ['always'],
  '@stylistic/function-call-spacing': [],
  '@stylistic/linebreak-style': [],
  '@stylistic/no-confusing-arrow': [],
  '@stylistic/quotes': ['single'],

  // eslint-plugin-import
  'import/extensions': ['ignorePackages'],
  'import/first': [],
  'import/newline-after-import': [],
  'import/no-commonjs': [{ allowConditionalRequire: false }],
  'import/no-dynamic-require': [],
  'import/no-unresolved': [{
    ignore: ['^@octokit/rest$'],
  }],
  'import/order': [{
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
    alphabetize: {
      order: 'asc',
      caseInsensitive: true,
    },
    named: {
      enabled: true,
      cjsExports: false,
    },
  }],

  // eslint-plugin-jsdoc
  'jsdoc/check-alignment': [],
  'jsdoc/check-indentation': [],
  'jsdoc/check-param-names': [],
  'jsdoc/check-syntax': [],
  'jsdoc/check-tag-names': [],
  'jsdoc/check-types': [],
  'jsdoc/implements-on-classes': [],
  'jsdoc/require-jsdoc': [{
    enableFixer: false,
    require: {
      FunctionDeclaration: true,
      MethodDefinition: true,
      ClassDeclaration: true,
      ArrowFunctionExpression: false,
      FunctionExpression: false,
    },
  }],
  'jsdoc/require-param': [],
  'jsdoc/require-param-description': [],
  'jsdoc/require-param-name': [],
  'jsdoc/require-param-type': [],
  'jsdoc/require-returns': [],
  'jsdoc/require-returns-check': [],
  'jsdoc/prefer-import-tag': [{ enableFixer: true, exemptTypedefs: false }],
  'jsdoc/require-returns-description': [],
  'jsdoc/require-returns-type': [],
  'jsdoc/valid-types': [],

  // eslint-plugin-jsonc
  'jsonc/auto': [],

  // eslint-plugin-promise
  'promise/no-callback-in-promise': [],
  'promise/no-multiple-resolved': [],
  'promise/no-nesting': [],
  'promise/no-promise-in-callback': [],
  'promise/no-return-in-finally': [],
  'promise/prefer-await-to-then': [],
  'promise/valid-params': [],

  // eslint-plugin-sonarjs
  'sonarjs/no-inverted-boolean-check': [],

  // eslint-plugin-unicorn
  'unicorn/import-style': [{
    styles: {
      'fs/promises': { named: true },
    },
  }],
  'unicorn/prefer-export-from': [{ ignoreUsedVariables: true }],
  'unicorn/prevent-abbreviations': [{
    replacements: {
      ref: false,
      env: false,
      man: { manufacturer: true },
      fix: { fixture: true },
      ch: { channel: true },
      cap: { capability: true },
      caps: { capabilities: true },
      cat: { category: true },
      cats: { categories: true },
    },
  }],
  'unicorn/text-encoding-identifier-case': [{ withDash: true }],

  // eslint-plugin-vue
  'vue/block-lang': [{
    script: { allowNoLang: true },
    style: { lang: 'scss' },
    template: { allowNoLang: true },
  }],
  'vue/block-order': [{
    order: ['template', 'style[scoped]', 'style:not([scoped])', 'script'],
  }],
  'vue/component-options-name-casing': [],
  'vue/component-name-in-template-casing': ['PascalCase', {
    registeredComponentsOnly: false,
  }],
  'vue/enforce-style-attribute': [],
  'vue/html-button-has-type': [],
  'vue/html-closing-bracket-newline': [{
    singleline: 'never',
    multiline: 'never',
  }],
  'vue/match-component-file-name': [{
    extensions: ['vue'],
    shouldMatchCase: true,
  }],
  'vue/match-component-import-name': [],
  'vue/max-attributes-per-line': [{ singleline: 3 }],
  'vue/next-tick-style': [],
  'vue/no-boolean-default': ['default-false'],
  'vue/no-duplicate-class-names': [],
  'vue/no-empty-component-block': [],
  'vue/no-undef-components': [{
    ignorePatterns: [
      '^Ofl(Svg|Time)$', // global components
      '^Nuxt(Link)?$', '^ClientOnly$', // Nuxt components
      '^VueForm$', '^Validate$', '^FieldMessages$', // VueForm components
    ],
  }],
  'vue/no-undef-directives': [],
  'vue/no-undef-properties': [],
  'vue/no-unused-emit-declarations': [],
  'vue/no-unused-properties': [{
    groups: ['props', 'data', 'computed', 'methods', 'setup'],
    ignorePublicMembers: true,
  }],
  'vue/no-unused-refs': [],
  'vue/no-use-v-else-with-v-for': [],
  'vue/no-v-text': [],
  'vue/prefer-prop-type-boolean-first': [],
  'vue/prefer-separate-static-class': [],
  'vue/prefer-true-attribute-shorthand': [],
  'vue/require-direct-export': [],
  'vue/v-for-delimiter-style': ['of'],
  'vue/v-if-else-key': [],
  'vue/v-on-handler-style': ['inline'],
  'vue/v-slot-style': ['shorthand'],

  // Vue 3 migration
  'vue/no-deprecated-data-object-declaration': [],
  // 'vue/no-deprecated-destroyed-lifecycle': [], // impossible to fix in Vue 2 (without Composition API)
  'vue/no-deprecated-dollar-listeners-api': [],
  'vue/no-deprecated-dollar-scopedslots-api': [],
  'vue/no-deprecated-events-api': [],
  'vue/no-deprecated-filter': [],
  'vue/no-deprecated-functional-template': [],
  'vue/no-deprecated-html-element-is': [],
  'vue/no-deprecated-inline-template': [],
  'vue/no-deprecated-model-definition': [{
    allowVue3Compat: true,
  }],
  'vue/no-deprecated-props-default-this': [],
  'vue/no-deprecated-router-link-tag-prop': [],
  'vue/no-deprecated-scope-attribute': [],
  'vue/no-deprecated-slot-attribute': [],
  'vue/no-deprecated-slot-scope-attribute': [],
  'vue/no-deprecated-v-bind-sync': [],
  'vue/no-deprecated-v-is': [],
  'vue/no-deprecated-v-on-native-modifier': [],
  'vue/no-deprecated-v-on-number-modifiers': [],
  'vue/no-deprecated-vue-config-keycodes': [],
  'vue/no-expose-after-await': [],
  'vue/no-lifecycle-after-await': [],
  'vue/no-negated-condition': [],
  'vue/no-negated-v-if-condition': [],
  'vue/no-watch-after-await': [],
  'vue/prefer-import-from-vue': [],
  'vue/require-explicit-emits': [],
  'vue/require-slots-as-functions': [],
  'vue/require-toggle-inside-transition': [],
  'vue/v-on-event-hyphenation': [],

  // eslint-plugin-vuejs-accessibility
  'vuejs-accessibility/no-aria-hidden-on-focusable': [],
  'vuejs-accessibility/no-role-presentation-on-focusable': [],

  // already included in presets, but needed here because we reduce severity to `warn`
  'sonarjs/cognitive-complexity': [],
  'sonarjs/no-nested-functions': [],
  'sonarjs/regex-complexity': [],
  'sonarjs/slow-regex': [],
  'sonarjs/todo-tag': [],
  'unicorn/no-array-for-each': [],
  'vue/no-mutating-props': [],
  'vue/no-v-html': [],
};

const vueExtensionRules = {
  'vue/array-bracket-newline': '@stylistic/array-bracket-newline',
  'vue/array-bracket-spacing': '@stylistic/array-bracket-spacing',
  'vue/array-element-newline': '@stylistic/array-element-newline',
  'vue/arrow-spacing': '@stylistic/arrow-spacing',
  'vue/block-spacing': '@stylistic/block-spacing',
  'vue/brace-style': '@stylistic/brace-style',
  'vue/camelcase': 'camelcase',
  'vue/comma-dangle': '@stylistic/comma-dangle',
  'vue/comma-spacing': '@stylistic/comma-spacing',
  'vue/comma-style': '@stylistic/comma-style',
  'vue/dot-location': '@stylistic/dot-location',
  'vue/dot-notation': 'dot-notation',
  'vue/eqeqeq': 'eqeqeq',
  'vue/func-call-spacing': '@stylistic/function-call-spacing',
  'vue/key-spacing': '@stylistic/key-spacing',
  'vue/keyword-spacing': '@stylistic/keyword-spacing',
  'vue/max-len': '@stylistic/max-len',
  'vue/multiline-ternary': '@stylistic/multiline-ternary',
  'vue/no-console': 'no-console',
  'vue/no-constant-condition': 'no-constant-condition',
  'vue/no-empty-pattern': 'no-empty-pattern',
  'vue/no-extra-parens': '@stylistic/no-extra-parens',
  'vue/no-implicit-coercion': 'no-implicit-coercion',
  'vue/no-irregular-whitespace': 'no-irregular-whitespace',
  'vue/no-loss-of-precision': 'no-loss-of-precision',
  'vue/no-negated-condition': 'no-negated-condition',
  'vue/no-restricted-syntax': 'no-restricted-syntax',
  'vue/no-sparse-arrays': 'no-sparse-arrays',
  'vue/no-useless-concat': 'no-useless-concat',
  'vue/object-curly-newline': '@stylistic/object-curly-newline',
  'vue/object-curly-spacing': '@stylistic/object-curly-spacing',
  'vue/object-property-newline': '@stylistic/object-property-newline',
  'vue/object-shorthand': 'object-shorthand',
  'vue/operator-linebreak': '@stylistic/operator-linebreak',
  'vue/prefer-template': 'prefer-template',
  'vue/quote-props': '@stylistic/quote-props',
  'vue/space-in-parens': '@stylistic/space-in-parens',
  'vue/space-infix-ops': '@stylistic/space-infix-ops',
  'vue/space-unary-ops': '@stylistic/space-unary-ops',
  'vue/template-curly-spacing': '@stylistic/template-curly-spacing',
};

const warnRules = new Set([
  'jsdoc/require-jsdoc',
  'sonarjs/cognitive-complexity',
  'sonarjs/no-nested-functions',
  'sonarjs/regex-complexity',
  'sonarjs/slow-regex',
  'sonarjs/todo-tag',
  'vue/no-mutating-props',
  'vue/no-v-html',
]);

const disabledRules = [
  'no-console',
  'jsdoc/empty-tags',
  'jsdoc/newline-after-description',
  'jsdoc/no-defaults', // useful for model docs generation
  'jsdoc/require-description',
  'jsdoc/require-description-complete-sentence',
  'jsdoc/tag-lines',
  'sonarjs/no-os-command-from-path',
  'sonarjs/no-unsafe-unzip',
  'sonarjs/os-command',
  'sonarjs/pseudo-random',
  'unicorn/consistent-function-scoping',
  'unicorn/filename-case',
  'unicorn/no-null',
  'unicorn/no-process-exit',
  'unicorn/no-useless-switch-case', // explicit "useless" switch chases are documentation
  'unicorn/no-useless-undefined', // conflicts with `consistent-return`
  'unicorn/prefer-dom-node-dataset', // grepping ability of `getAttribute('data-foo-bar')` is better than `dataset.fooBar`
  'unicorn/prefer-global-this',
  'unicorn/prefer-node-protocol', // not supported by Nuxt yet
  'vue/multiline-html-element-content-newline',
  'vue/singleline-html-element-content-newline',
  'vuejs-accessibility/form-control-has-label',
  'vuejs-accessibility/label-has-for',
];

const getRuleParameters = (ruleOptions) => (Array.isArray(ruleOptions) ? ruleOptions.slice(1) : []);

for (const [vueRuleName, extendedRuleName] of Object.entries(vueExtensionRules)) {
  if (enabledRuleParameters[extendedRuleName]) {
    enabledRuleParameters[vueRuleName] = enabledRuleParameters[extendedRuleName];
  }
  else if (eslintJs.configs.recommended.rules[extendedRuleName] && eslintJs.configs.recommended.rules[extendedRuleName] !== 'off') {
    enabledRuleParameters[vueRuleName] = getRuleParameters(eslintJs.configs.recommended.rules[extendedRuleName]);
  }
  else if (stylisticEslintConfig.rules[extendedRuleName] && stylisticEslintConfig.rules[extendedRuleName] !== 'off') {
    enabledRuleParameters[vueRuleName] = getRuleParameters(stylisticEslintConfig.rules[extendedRuleName]);
  }
}

export default [
  {
    ignores: [
      'package-lock.json',
      'fixtures/register.json',
      'server/ofl-secrets.json',
      '.vscode/',
      '.nuxt/',
      'node_modules/',
      'tmp/',
    ],
  },
  eslintJs.configs.recommended,
  stylisticEslintConfig,
  eslintPluginImport.flatConfigs.recommended,
  eslintPluginJsdoc.configs['flat/recommended-typescript-flavor'],
  eslintPluginNuxtConfigRecommended,
  eslintPluginPromise.configs['flat/recommended'],
  eslintPluginSonarjs.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  ...eslintPluginVue.configs['flat/vue2-recommended-error'],
  ...eslintPluginVueA11y.configs['flat/recommended'],
  ...eslintPluginJsoncConfigs['recommended-with-json'], // has to be after `vue`
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2025,
      sourceType: 'module',
    },
    rules: {
      ...Object.fromEntries(
        Object.entries(enabledRuleParameters).map(([ruleName, parameters]) => [
          ruleName,
          [warnRules.has(ruleName) ? 'warn' : 'error', ...parameters],
        ]),
      ),
      ...Object.fromEntries(
        disabledRules.map((ruleName) => [ruleName, 'off']),
      ),
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          augments: 'extends',
          class: 'constructor',
          file: 'fileoverview',
          fires: 'emits',
          linkcode: 'link',
          linkplain: 'link',
          overview: 'fileoverview',
        },
        preferredTypes: {
          '*': 'any',
          'array': 'Array',
          'Boolean': 'boolean',
          'Number': 'number',
          'Object': 'object',
          'String': 'string',
          '.<>': '<>',
          'Array<>': '[]',
          'object<>': 'Record<>',
          'Object<>': 'Record<>',
        },
      },
    },
  },
  ...eslintMarkdown.configs.processor,
  {
    files: ['**/*.md/*.js'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['**/*.cjs', 'server/**.js'],
    languageOptions: {
      sourceType: 'script',
    },
    rules: {
      'import/no-commonjs': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
  {
    files: ['ui/layouts/*.vue', 'ui/pages/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['fixtures/**/*.json'],
    rules: {
      // allow alignment of pixel keys in matrix
      '@stylistic/no-multi-spaces': ['error', {
        exceptions: {
          JSONArrayExpression: true,
        },
      }],
      'jsonc/array-bracket-spacing': 'off',

      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: ['.devcontainer/devcontainer.json'],
    rules: {
      'jsonc/no-comments': 'off',
    },
  },
  {
    files: ['tests/*.test.js'],
    ...eslintPluginVitest.configs.recommended,
  },
];
