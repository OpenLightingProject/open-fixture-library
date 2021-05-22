const pluginPresets = {
  'array-func': `all`,
  import: `recommended`,
  jsdoc: `recommended`,
  markdown: `recommended`,
  nuxt: `recommended`,
  promise: `recommended`,
  security: `recommended`,
  unicorn: `recommended`,
  vue: `recommended`,
  jsonc: `recommended-with-json`, // has to be after `vue` and `nuxt`
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
  'complexity': [7],
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
  'linebreak-style': [],
  'new-parens': [],
  'no-array-constructor': [],
  'no-bitwise': [],
  'no-confusing-arrow': [{ allowParens: true }],
  'no-else-return': [{ allowElseIf: false }],
  'no-irregular-whitespace': [],
  'no-lonely-if': [],
  'no-loop-func': [],
  'no-mixed-operators': [],
  'no-multi-spaces': [],
  'no-new-object': [],
  'no-prototype-builtins': [],
  'no-return-assign': [],
  'no-return-await': [],
  'no-shadow': [{ builtinGlobals: false }],
  'no-template-curly-in-string': [],
  'no-trailing-spaces': [],
  'no-unsafe-optional-chaining': [{ 'disallowArithmeticOperators': true }],
  'no-unused-vars': [{ args: `none` }],
  'no-var': [],
  'object-curly-spacing': [`always`],
  'object-shorthand': [`always`, { avoidQuotes: true }],
  'prefer-arrow-callback': [],
  'prefer-const': [{ destructuring: `all` }],
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
  'import/no-commonjs': [{ allowConditionalRequire: false }],
  'import/no-dynamic-require': [],
  'import/no-unresolved': [{
    ignore: [`^fs/promises$`],
  }],
  'import/order': [{
    groups: [`builtin`, `external`, `internal`, `parent`, `sibling`],
    alphabetize: {
      order: `asc`,
      caseInsensitive: true,
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

  // eslint-plugin-promise
  'promise/no-callback-in-promise': [],
  'promise/no-nesting': [],
  'promise/no-promise-in-callback': [],
  'promise/no-return-in-finally': [],
  'promise/prefer-await-to-then': [],
  'promise/valid-params': [],

  // eslint-plugin-unicorn
  'unicorn/import-style': [{
    styles: {
      fs: {
        unassigned: false,
        default: false,
        namespace: false,
        named: false,
      },
      'fs/promises': {
        named: true,
      },
    },
  }],
  'unicorn/prevent-abbreviations': [{
    replacements: {
      ref: false,
      env: false,
      man: { manufacturer: true },
      fix: { fixture: true },
      ch: { channel: true },
      cap: { capability: true },
      caps: { capabilities: true },
    },
  }],

  // eslint-plugin-vue
  'vue/component-name-in-template-casing': [`PascalCase`, {
    registeredComponentsOnly: false,
  }],
  'vue/component-tags-order': [{
    order: [`template`, `style`, `script`],
  }],
  'vue/html-button-has-type': [],
  'vue/html-closing-bracket-newline': [{
    singleline: `never`,
    multiline: `never`,
  }],
  'vue/match-component-file-name': [{
    extensions: [`vue`],
    shouldMatchCase: true,
  }],
  'vue/max-attributes-per-line': [{ singleline: 3 }],
  'vue/next-tick-style': [],
  'vue/no-deprecated-scope-attribute': [],
  'vue/no-deprecated-slot-attribute': [],
  'vue/no-deprecated-slot-scope-attribute': [],
  'vue/no-empty-component-block': [],
  'vue/no-invalid-model-keys': [],
  'vue/no-unused-properties': [{
    groups: [`props`, `data`, `computed`, `methods`, `setup`],
    ignorePublicMembers: true,
  }],
  'vue/no-unused-refs': [],
  'vue/require-direct-export': [],
  'vue/v-for-delimiter-style': [`of`],
  'vue/v-on-function-call': [`always`],
  'vue/v-slot-style': [`shorthand`],
  'vue/valid-next-tick': [],

  // already included in presets, but needed here because we reduce severity to `warn`
  'unicorn/no-array-for-each': [],
  'vue/no-mutating-props': [],
};

const vueCoreExtensionRules = [
  `array-bracket-newline`,
  `array-bracket-spacing`,
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
  `no-constant-condition`,
  `no-empty-pattern`,
  `no-extra-parens`,
  `no-irregular-whitespace`,
  `no-restricted-syntax`,
  `no-sparse-arrays`,
  `no-useless-concat`,
  `object-curly-newline`,
  `object-curly-spacing`,
  `object-property-newline`,
  `operator-linebreak`,
  `prefer-template`,
  `space-in-parens`,
  `space-infix-ops`,
  `space-unary-ops`,
  `template-curly-spacing`,
];

const warnRules = new Set([
  `complexity`,
  `jsdoc/require-jsdoc`,
  `unicorn/no-array-for-each`,
  `vue/no-mutating-props`,
]);

const disabledRules = [
  `no-console`,
  `jsdoc/newline-after-description`,
  `jsdoc/no-undefined-types`,
  `jsdoc/require-description`,
  `jsdoc/require-description-complete-sentence`,
  `promise/always-return`,
  `security/detect-child-process`,
  `security/detect-non-literal-fs-filename`,
  `security/detect-non-literal-require`,
  `security/detect-object-injection`,
  `unicorn/consistent-function-scoping`,
  `unicorn/filename-case`,
  `unicorn/no-null`,
  `unicorn/no-process-exit`,
  `unicorn/no-array-reduce`,
  `unicorn/no-useless-undefined`,
  `unicorn/prefer-node-protocol`,
  `unicorn/prefer-spread`,
  `vue/multiline-html-element-content-newline`,
  `vue/singleline-html-element-content-newline`,
];

for (const ruleName of vueCoreExtensionRules) {
  if (ruleName in enabledRuleParameters) {
    enabledRuleParameters[`vue/${ruleName}`] = enabledRuleParameters[ruleName];
  }
}

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
  plugins: Object.keys(pluginPresets),
  extends: [
    `eslint:recommended`,
    ...Object.entries(pluginPresets).map(([plugin, preset]) => `plugin:${plugin}/${preset}`),
  ],
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
      mode: `typescript`,
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
        array: `Array`,
        boolean: `Boolean`,
        number: `Number`,
        object: `Object`,
        string: `String`,
        '<>': `.<>`,
        '[]': `Array.<>`,
      },
    },
  },
  ignorePatterns: [`package-lock.json`],
  overrides: [
    {
      files: [`**/*.md/*.js`],
      rules: {
        'jsdoc/require-jsdoc': `off`,
      },
    },
    {
      files: [`**/*.cjs`, `server/**.js`],
      parserOptions: {
        sourceType: `script`,
      },
      rules: {
        'import/no-commonjs': `off`,
        'unicorn/prefer-module': `off`,
      },
    },
    {
      files: [`**/*.vue`],
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
  ],
};
