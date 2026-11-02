import { configure, defineRule } from 'vee-validate';
import { validationRules } from '../utils/validation-rules';
import { defineNuxtPlugin } from '#app';

export { validationRules } from '../utils/validation-rules';

export default defineNuxtPlugin({
  name: 'vee-validate',
  parallel: true,
  setup() {
    // The editor uses the rule name as the error identifier, exactly like the
    // old `vue-form` `$error` object, so the message templates in
    // `LabeledInput.vue` keep working unchanged.
    configure({
      generateMessage: ({ rule }) => rule.name,
    });

    for (const [name, validator] of Object.entries(validationRules)) {
      defineRule(name, validator);
    }
  },
});
