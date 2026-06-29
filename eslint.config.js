import eslintJs from '@eslint/js';
import eslintMarkdown from '@eslint/markdown';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintPluginVitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import eslintPluginImport from 'eslint-plugin-import-x';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import { configs as eslintPluginJsoncConfigs } from 'eslint-plugin-jsonc';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginSonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';
import fixtureJsonArrayFormatRule from './lib/internal-eslint-rules/fixture-json-array-format.js';
import internalNuxt2EslintPlugin from './lib/internal-eslint-rules/nuxt2/index.js';

const stylisticEslintConfig = eslintPluginStylistic.configs.customize({
  arrowParens: true,
  semi: true,
});

// Core ESLint rules
const coreRules = {
  'accessor-pairs': 'error',
  'camelcase': 'error',
  'consistent-return': 'error',
  'curly': ['error', 'all'],
  'dot-notation': 'error',
  'eqeqeq': ['error', 'always', { null: 'ignore' }],
  'getter-return': 'error',
  'grouped-accessor-pairs': ['error', 'getBeforeSet'],
  'guard-for-in': 'error',
  'no-array-constructor': 'error',
  'no-bitwise': 'error',
  'no-console': 'off',
  'no-constant-binary-expression': 'error',
  'no-else-return': ['error', { allowElseIf: false }],
  'no-empty': 'error',
  'no-empty-function': 'error',
  'no-irregular-whitespace': 'error',
  'no-lonely-if': 'error',
  'no-loop-func': 'error',
  'no-nested-ternary': 'error',
  'no-object-constructor': 'error',
  'no-prototype-builtins': 'error',
  'no-restricted-imports': ['error', {
    name: 'fs',
    message: 'Please use \'fs/promises\' instead.',
  }],
  'no-return-assign': 'error',
  'no-return-await': 'error',
  'no-shadow': ['error', {
    builtinGlobals: false,
    allow: ['_'], // allow placeholder parameters that aren't used anyway
  }],
  'no-template-curly-in-string': 'error',
  'no-unsafe-optional-chaining': ['error', { disallowArithmeticOperators: true }],
  'no-unused-expressions': 'error',
  'no-unused-vars': ['error', { args: 'none' }],
  'no-useless-assignment': 'error',
  'no-var': 'error',
  'object-shorthand': 'error',
  'prefer-arrow-callback': 'error',
  'prefer-const': ['error', { destructuring: 'all' }],
  'prefer-object-spread': 'error',
  'prefer-rest-params': 'error',
  'prefer-template': 'error',
  'radix': 'error',
};

// eslint-plugin-stylistic
const stylisticRules = {
  '@stylistic/curly-newline': ['error', 'always'],
  '@stylistic/function-call-spacing': 'error',
  '@stylistic/linebreak-style': 'error',
  '@stylistic/no-confusing-arrow': 'error',
  '@stylistic/quotes': ['error', 'single'],
};

// eslint-plugin-import-x
const importRules = {
  'import-x/extensions': ['error', 'ignorePackages'],
  'import-x/first': 'error',
  'import-x/newline-after-import': 'error',
  'import-x/no-commonjs': ['error', { allowConditionalRequire: false }],
  'import-x/no-dynamic-require': 'error',
  'import-x/no-unresolved': ['error', {
    ignore: ['^@octokit/rest$', '^uuid$'],
  }],
  'import-x/order': ['error', {
    'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
    'alphabetize': {
      order: 'asc',
      caseInsensitive: true,
      orderImportKind: 'desc',
    },
    'named': {
      enabled: true,
      cjsExports: false,
    },
    'newlines-between': 'never',
  }],
};

// eslint-plugin-jsdoc
const jsdocRules = {
  'jsdoc/check-indentation': 'error',
  'jsdoc/check-syntax': 'error',
  'jsdoc/no-defaults': 'off', // useful for model docs generation
  'jsdoc/prefer-import-tag': ['error', { enableFixer: true, exemptTypedefs: false }],
  'jsdoc/require-description': 'off',
  'jsdoc/require-hyphen-before-param-description': 'error',
  'jsdoc/require-jsdoc': ['error', {
    enableFixer: false,
    require: {
      FunctionDeclaration: true,
      MethodDefinition: true,
      ClassDeclaration: true,
      ArrowFunctionExpression: false,
      FunctionExpression: false,
    },
  }],
  'jsdoc/tag-lines': ['error', 'never', { startLines: null }],
};

// eslint-plugin-jsonc
const jsoncRules = {
  'jsonc/auto': 'error',
};

// eslint-plugin-promise
const promiseRules = {
  'promise/no-callback-in-promise': 'error',
  'promise/no-multiple-resolved': 'error',
  'promise/no-nesting': 'error',
  'promise/no-promise-in-callback': 'error',
  'promise/no-return-in-finally': 'error',
  'promise/prefer-await-to-then': 'error',
  'promise/valid-params': 'error',
};

// eslint-plugin-sonarjs
const sonarjsRules = {
  'sonarjs/cognitive-complexity': 'warn', // reduced from `error` in the preset
  'sonarjs/no-inverted-boolean-check': 'error',
  'sonarjs/no-nested-functions': 'warn', // reduced from `error` in the preset
  'sonarjs/no-os-command-from-path': 'off',
  'sonarjs/os-command': 'off',
  'sonarjs/pseudo-random': 'off',
  'sonarjs/regex-complexity': 'warn', // reduced from `error` in the preset
  'sonarjs/super-linear-regex': 'off',
  'sonarjs/todo-tag': 'warn', // reduced from `error` in the preset
};

// eslint-plugin-unicorn
const unicornRules = {
  'unicorn/consistent-class-member-order': 'off', // cosmetic ordering that would separate private helpers from their callers
  'unicorn/consistent-function-scoping': 'off',
  'unicorn/default-export-style': 'off', // `export default class X {}` breaks jsdoc2md class detection in `build:model-docs`
  'unicorn/dom-node-dataset': ['error', { preferAttributes: true }],
  'unicorn/filename-case': 'off',
  'unicorn/import-style': ['error', {
    styles: {
      'fs/promises': { named: true },
    },
  }],
  'unicorn/name-replacements': ['error', {
    replacements: {
      ref: false,
      env: false,
      repository: false, // we prefer the full word over `repo`
      man: { manufacturer: true },
      fix: { fixture: true },
      ch: { channel: true },
      cap: { capability: true },
      caps: { capabilities: true },
      cat: { category: true },
      cats: { categories: true },
    },
  }],
  'unicorn/no-computed-property-existence-check': 'off', // dynamic `key in obj` checks are fine and widely used
  'unicorn/no-null': 'off',
  'unicorn/no-process-exit': 'off',
  'unicorn/no-this-outside-of-class': 'off', // needed in Vue Options API
  'unicorn/no-top-level-assignment-in-function': 'off', // module-level state assigned from functions is intentional here
  'unicorn/no-top-level-side-effects': 'off', // some modules legitimately set up state at import time
  'unicorn/no-useless-switch-case': 'off', // explicit "useless" switch chases are documentation
  'unicorn/no-useless-undefined': 'off', // conflicts with `consistent-return`
  'unicorn/prefer-export-from': ['error', { checkUsedVariables: false }],
  'unicorn/prefer-global-this': 'off',
  'unicorn/prefer-https': 'off', // there are still many HTTP-only websites
  'unicorn/prefer-node-protocol': 'off', // not supported by Nuxt yet
  'unicorn/prefer-number-coercion': 'off', // `Number.parseInt(x, 10)` is intentional and not equivalent to `Number(x)`
  'unicorn/prefer-uint8array-base64': 'off', // `Uint8Array.fromBase64()`/`toBase64()` are not available in the supported Node.js/browser versions yet
  'unicorn/text-encoding-identifier-case': ['error', { withDash: true }],
};

// eslint-plugin-vue
const vueRules = {
  'vue/block-lang': ['error', {
    script: { allowNoLang: true },
    style: { lang: 'scss' },
    template: { allowNoLang: true },
  }],
  'vue/block-order': ['error', {
    order: ['template', 'style[scoped]', 'style:not([scoped])', 'script'],
  }],
  'vue/component-name-in-template-casing': ['error', 'PascalCase', {
    registeredComponentsOnly: false,
  }],
  'vue/component-options-name-casing': 'error',
  'vue/enforce-style-attribute': 'error',
  'vue/html-button-has-type': 'error',
  'vue/html-closing-bracket-newline': ['error', {
    singleline: 'never',
    multiline: 'never',
  }],
  'vue/match-component-file-name': ['error', {
    extensions: ['vue'],
    shouldMatchCase: true,
  }],
  'vue/match-component-import-name': 'error',
  'vue/max-attributes-per-line': ['error', { singleline: 3 }],
  'vue/multiline-html-element-content-newline': 'off',
  'vue/next-tick-style': 'error',
  'vue/no-boolean-default': ['error', 'default-false'],
  'vue/no-duplicate-class-names': 'error',
  'vue/no-empty-component-block': 'error',
  'vue/no-mutating-props': 'warn', // reduced from `error` in the preset
  'vue/no-undef-components': ['error', {
    ignorePatterns: [
      '^Ofl(Svg|Time)$', // global components
      '^Nuxt(Link)?$', '^ClientOnly$', // Nuxt components
      '^VueForm$', '^Validate$', '^FieldMessages$', // VueForm components
    ],
  }],
  'vue/no-undef-directives': 'error',
  'vue/no-undef-properties': 'error',
  'vue/no-unused-emit-declarations': 'error',
  'vue/no-unused-properties': ['error', {
    groups: ['props', 'data', 'computed', 'methods', 'setup'],
    ignorePublicMembers: true,
  }],
  'vue/no-unused-refs': 'error',
  'vue/no-use-v-else-with-v-for': 'error',
  'vue/no-v-html': 'warn', // reduced from `error` in the preset
  'vue/no-v-text': 'error',
  'vue/prefer-prop-type-boolean-first': 'error',
  'vue/prefer-separate-static-class': 'error',
  'vue/prefer-single-event-payload': 'error',
  'vue/prefer-true-attribute-shorthand': 'error',
  'vue/require-direct-export': 'error',
  'vue/singleline-html-element-content-newline': 'off',
  'vue/v-for-delimiter-style': ['error', 'of'],
  'vue/v-if-else-key': 'error',
  'vue/v-on-handler-style': ['error', 'inline'],
  'vue/v-slot-style': ['error', 'shorthand'],

  // Vue 3 migration
  'vue/no-deprecated-data-object-declaration': 'error',
  // 'vue/no-deprecated-destroyed-lifecycle': 'error', // impossible to fix in Vue 2 (without Composition API)
  'vue/no-deprecated-dollar-listeners-api': 'error',
  'vue/no-deprecated-dollar-scopedslots-api': 'error',
  'vue/no-deprecated-events-api': 'error',
  'vue/no-deprecated-filter': 'error',
  'vue/no-deprecated-functional-template': 'error',
  'vue/no-deprecated-html-element-is': 'error',
  'vue/no-deprecated-inline-template': 'error',
  'vue/no-deprecated-model-definition': ['error', {
    allowVue3Compat: true,
  }],
  'vue/no-deprecated-props-default-this': 'error',
  'vue/no-deprecated-router-link-tag-prop': 'error',
  'vue/no-deprecated-scope-attribute': 'error',
  'vue/no-deprecated-slot-attribute': 'error',
  'vue/no-deprecated-slot-scope-attribute': 'error',
  'vue/no-deprecated-v-bind-sync': 'error',
  'vue/no-deprecated-v-is': 'error',
  'vue/no-deprecated-v-on-native-modifier': 'error',
  'vue/no-deprecated-v-on-number-modifiers': 'error',
  'vue/no-deprecated-vue-config-keycodes': 'error',
  'vue/no-expose-after-await': 'error',
  'vue/no-lifecycle-after-await': 'error',
  'vue/no-negated-condition': 'error',
  'vue/no-negated-v-if-condition': 'error',
  'vue/no-watch-after-await': 'error',
  'vue/prefer-import-from-vue': 'error',
  'vue/require-explicit-emits': 'error',
  'vue/require-slots-as-functions': 'error',
  'vue/require-toggle-inside-transition': 'error',
  'vue/v-on-event-hyphenation': 'error',
};

// eslint-plugin-vuejs-accessibility
const vueA11yRules = {
  'vuejs-accessibility/form-control-has-label': 'off',
  'vuejs-accessibility/label-has-for': 'off',
  'vuejs-accessibility/no-aria-hidden-on-focusable': 'error',
  'vuejs-accessibility/no-role-presentation-on-focusable': 'error',
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

const extendableRuleConfigs = {
  ...eslintJs.configs.recommended.rules,
  ...coreRules,
  ...stylisticEslintConfig.rules,
  ...stylisticRules,
};

const vueExtensionRuleConfigs = Object.fromEntries(
  Object.entries(vueExtensionRules)
    .map(([vueRuleName, extendedRuleName]) => [vueRuleName, extendableRuleConfigs[extendedRuleName]])
    .filter(([, extendedConfig]) => extendedConfig !== undefined),
);

export default defineConfig([
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
  eslintPluginJsdoc.configs['flat/recommended-typescript-flavor-error'],
  internalNuxt2EslintPlugin.configs.all,
  eslintPluginPromise.configs['flat/recommended'],
  eslintPluginSonarjs.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs', '**/*.vue'],
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: unicornRules,
  },
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
      ...coreRules,
      ...stylisticRules,
      ...importRules,
      ...jsdocRules,
      ...jsoncRules,
      ...promiseRules,
      ...sonarjsRules,
      ...vueRules,
      ...vueA11yRules,
      ...vueExtensionRuleConfigs,
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
      'import-x/no-unresolved': 'off',
    },
  },
  {
    files: ['**/*.cjs', 'server/**.js'],
    languageOptions: {
      sourceType: 'script',
    },
    rules: {
      'import-x/no-commonjs': 'off',
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
    plugins: {
      ofl: {
        rules: {
          'fixture-json-array-format': fixtureJsonArrayFormatRule,
        },
      },
    },
    rules: {
      // allow alignment of pixel keys in matrix
      '@stylistic/no-multi-spaces': ['error', {
        exceptions: {
          JSONArrayExpression: true,
        },
      }],
      'jsonc/array-bracket-spacing': 'off',

      'ofl/fixture-json-array-format': 'error',
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
]);
