import { fixupPluginRules } from '@eslint/compat';
import eslintJs from '@eslint/js';
import eslintMarkdown from '@eslint/markdown';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import eslintPluginNuxt from 'eslint-plugin-nuxt';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginSonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';

const eslintPluginNuxtConfigRecommended = {
  plugins: {
    nuxt: fixupPluginRules(eslintPluginNuxt),
  },
  rules: {
    ...eslintPluginNuxt.configs.base.rules,
    ...eslintPluginNuxt.configs.recommended.rules,
  },
};

const enabledRuleParameters = {
  // Core ESLint rules
  'accessor-pairs': [],
  'array-bracket-spacing': [],
  'arrow-parens': [`as-needed`],
  'arrow-spacing': [],
  'block-spacing': [],
  'brace-style': [`stroustrup`],
  'camelcase': [],
  'comma-dangle': [`always-multiline`],
  'comma-spacing': [],
  'comma-style': [],
  'consistent-return': [],
  'curly': [`all`],
  'dot-location': [`property`],
  'dot-notation': [],
  'eol-last': [`always`],
  'eqeqeq': [`always`, { null: `ignore` }],
  'func-call-spacing': [],
  'getter-return': [],
  'grouped-accessor-pairs': [`getBeforeSet`],
  'guard-for-in': [],
  'indent': [2, { SwitchCase: 1 }],
  'key-spacing': [],
  'keyword-spacing': [],
  'linebreak-style': [`unix`],
  'new-parens': [],
  'no-array-constructor': [],
  'no-bitwise': [],
  'no-confusing-arrow': [{ allowParens: true }],
  'no-constant-binary-expression': [],
  'no-else-return': [{ allowElseIf: false }],
  'no-irregular-whitespace': [],
  'no-lonely-if': [],
  'no-loop-func': [],
  'no-mixed-operators': [],
  'no-multi-spaces': [],
  'no-nested-ternary': [],
  'no-new-object': [],
  'no-prototype-builtins': [],
  'no-restricted-imports': [{
    name: `fs`,
    message: `Please use 'fs/promises' instead.`,
  }],
  'no-return-assign': [],
  'no-return-await': [],
  'no-shadow': [{
    builtinGlobals: false,
    allow: [`_`], // allow placeholder paramters that aren't used anyway
  }],
  'no-template-curly-in-string': [],
  'no-trailing-spaces': [],
  'no-unsafe-optional-chaining': [{ 'disallowArithmeticOperators': true }],
  'no-unused-vars': [{ args: `none` }],
  // 'no-useless-assignment': [], // TODO: enable when migrated to ESLint v9
  'no-var': [],
  'object-curly-spacing': [`always`],
  'object-shorthand': [`always`, { avoidQuotes: true }],
  'prefer-arrow-callback': [],
  'prefer-const': [{ destructuring: `all` }],
  'prefer-object-spread': [],
  'prefer-rest-params': [],
  'prefer-template': [],
  'quotes': [`backtick`, { allowTemplateLiterals: true }],
  'radix': [],
  'semi': [],
  'space-before-blocks': [],
  'space-before-function-paren': [{
    anonymous: `never`,
    named: `never`,
    asyncArrow: `always`,
  }],
  'space-in-parens': [],
  'space-infix-ops': [],
  'spaced-comment': [`always`],
  'template-curly-spacing': [],

  // eslint-plugin-import
  'import/extensions': [`ignorePackages`],
  'import/first': [],
  'import/newline-after-import': [],
  'import/no-commonjs': [{ allowConditionalRequire: false }],
  'import/no-dynamic-require': [],
  'import/no-unresolved': [{
    ignore: [`^chalk$`, `^@octokit/rest$`],
  }],
  'import/order': [{
    groups: [`builtin`, `external`, `internal`, `parent`, `sibling`],
    alphabetize: {
      order: `asc`,
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
  'jsdoc/require-returns-description': [],
  'jsdoc/require-returns-type': [],
  'jsdoc/valid-types': [],

  // eslint-plugin-jsonc
  'jsonc/auto': [],

  // eslint-plugin-nuxt
  'nuxt/require-func-head': [],

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

  // eslint-plugin-vue
  'vue/block-lang': [{
    script: { allowNoLang: true },
    style: { lang: `scss` },
    template: { allowNoLang: true },
  }],
  'vue/component-options-name-casing': [],
  'vue/component-name-in-template-casing': [`PascalCase`, {
    registeredComponentsOnly: false,
  }],
  'vue/component-tags-order': [{
    order: [`template`, `style[scoped]`, `style:not([scoped])`, `script`],
  }],
  'vue/enforce-style-attribute': [],
  'vue/html-button-has-type': [],
  'vue/html-closing-bracket-newline': [{
    singleline: `never`,
    multiline: `never`,
  }],
  'vue/match-component-file-name': [{
    extensions: [`vue`],
    shouldMatchCase: true,
  }],
  'vue/match-component-import-name': [],
  'vue/max-attributes-per-line': [{ singleline: 3 }],
  'vue/next-tick-style': [],
  'vue/no-boolean-default': [`default-false`],
  'vue/no-empty-component-block': [],
  'vue/no-undef-components': [{
    ignorePatterns: [
      `^Ofl(Svg|Time)$`, // global components
      `^Nuxt(Link)?$`, `^ClientOnly$`, // Nuxt components
      `^VueForm$`, `^Validate$`, `^FieldMessages$`, // VueForm components
    ],
  }],
  'vue/no-undef-properties': [],
  'vue/no-unused-emit-declarations': [],
  'vue/no-unused-properties': [{
    groups: [`props`, `data`, `computed`, `methods`, `setup`],
    ignorePublicMembers: true,
  }],
  'vue/no-unused-refs': [],
  'vue/no-use-v-else-with-v-for': [],
  'vue/no-v-text': [],
  'vue/prefer-prop-type-boolean-first': [],
  'vue/prefer-separate-static-class': [],
  'vue/prefer-true-attribute-shorthand': [],
  'vue/require-direct-export': [],
  'vue/v-for-delimiter-style': [`of`],
  'vue/v-if-else-key': [],
  'vue/v-on-handler-style': [`inline`],
  'vue/v-slot-style': [`shorthand`],

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
  'unicorn/no-array-for-each': [],
  'vue/no-mutating-props': [],
};

const vueCoreExtensionRules = [
  `array-bracket-newline`,
  `array-bracket-spacing`,
  `array-element-newline`,
  `arrow-spacing`,
  `block-spacing`,
  `brace-style`,
  `camelcase`,
  `comma-dangle`,
  `comma-spacing`,
  `comma-style`,
  `dot-location`,
  `dot-notation`,
  `eqeqeq`,
  `func-call-spacing`,
  `key-spacing`,
  `keyword-spacing`,
  `max-len`,
  `multiline-ternary`,
  `no-constant-condition`,
  `no-empty-pattern`,
  `no-extra-parens`,
  `no-irregular-whitespace`,
  `no-loss-of-precision`,
  `no-restricted-syntax`,
  `no-sparse-arrays`,
  `no-useless-concat`,
  `object-curly-newline`,
  `object-curly-spacing`,
  `object-property-newline`,
  `object-shorthand`,
  `operator-linebreak`,
  `prefer-template`,
  `quote-props`,
  `space-in-parens`,
  `space-infix-ops`,
  `space-unary-ops`,
  `template-curly-spacing`,
];

const warnRules = new Set([
  `jsdoc/require-jsdoc`,
  `sonarjs/cognitive-complexity`,
  `vue/no-mutating-props`,
]);

const disabledRules = [
  `no-console`,
  `jsdoc/empty-tags`,
  `jsdoc/newline-after-description`,
  `jsdoc/no-defaults`, // useful for model docs generation
  `jsdoc/require-description`,
  `jsdoc/require-description-complete-sentence`,
  `jsdoc/tag-lines`,
  `unicorn/consistent-function-scoping`,
  `unicorn/filename-case`,
  `unicorn/no-null`,
  `unicorn/no-process-exit`,
  `unicorn/no-useless-switch-case`, // explicit "useless" switch chases are documentation
  `unicorn/no-useless-undefined`, // conflicts with `consistent-return`
  `unicorn/prefer-global-this`,
  `unicorn/prefer-node-protocol`, // not supported by Nuxt yet
  `vue/multiline-html-element-content-newline`,
  `vue/singleline-html-element-content-newline`,
  `vuejs-accessibility/form-control-has-label`,
  `vuejs-accessibility/label-has-for`,
];

for (const ruleName of vueCoreExtensionRules) {
  if (ruleName in enabledRuleParameters) {
    enabledRuleParameters[`vue/${ruleName}`] = enabledRuleParameters[ruleName];
  }
}

export default [
  {
    ignores: [
      `package-lock.json`,
      `fixtures/register.json`,
      `server/ofl-secrets.json`,
      `.vscode/`,
      `.nuxt/`,
      `node_modules/`,
      `tmp/`,
    ],
  },
  eslintJs.configs.recommended,
  eslintPluginImport.flatConfigs.recommended,
  eslintPluginJsdoc.configs[`flat/recommended-typescript-flavor`],
  eslintPluginNuxtConfigRecommended,
  eslintPluginPromise.configs[`flat/recommended`],
  eslintPluginSonarjs.configs.recommended,
  eslintPluginUnicorn.configs[`flat/recommended`],
  ...eslintPluginVue.configs[`flat/vue2-recommended`],
  ...eslintPluginVueA11y.configs[`flat/recommended`],
  ...eslintPluginJsonc.configs[`flat/recommended-with-json`], // has to be after `vue`
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2022,
      sourceType: `module`,
    },
    rules: {
      ...Object.fromEntries(
        Object.entries(enabledRuleParameters).map(([ruleName, parameters]) => [
          ruleName,
          [warnRules.has(ruleName) ? `warn` : `error`, ...parameters],
        ]),
      ),
      ...Object.fromEntries(
        disabledRules.map(ruleName => [ruleName, `off`]),
      ),
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          augments: `extends`,
          class: `constructor`,
          file: `fileoverview`,
          fires: `emits`,
          linkcode: `link`,
          linkplain: `link`,
          overview: `fileoverview`,
        },
        preferredTypes: {
          '*': `any`,
          array: `Array`,
          Boolean: `boolean`,
          Number: `number`,
          Object: `object`,
          String: `string`,
          '.<>': `<>`,
          'Array<>': `[]`,
          'object<>': `Record<>`,
          'Object<>': `Record<>`,
        },
      },
    },
  },
  ...eslintMarkdown.configs.processor,
  {
    files: [`**/*.md/*.js`],
    rules: {
      'jsdoc/require-jsdoc': `off`,
      'import/no-unresolved': `off`,
    },
  },
  {
    files: [`**/*.cjs`, `server/**.js`],
    languageOptions: {
      sourceType: `script`,
    },
    rules: {
      'import/no-commonjs': `off`,
      'unicorn/prefer-module': `off`,
      'unicorn/prefer-top-level-await': `off`,
    },
  },
  {
    files: [`**/*.vue`],
  },
  {
    files: [`ui/layouts/*.vue`, `ui/pages/**/*.vue`],
    rules: {
      'vue/multi-word-component-names': `off`,
    },
  },
  {
    files: [`fixtures/**/*.json`],
    rules: {
      // allow alignment of pixel keys in matrix
      'no-multi-spaces': [`error`, {
        exceptions: {
          JSONArrayExpression: true,
        },
      }],
      'jsonc/array-bracket-spacing': `off`,

      'unicorn/prevent-abbreviations': `off`,
    },
  },
];
