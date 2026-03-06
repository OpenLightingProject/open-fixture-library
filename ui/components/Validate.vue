<template>
  <component :is="tag">
    <slot />
  </component>
</template>

<script>
export default {
  props: {
    state: {
      type: Object,
      default: null,
    },
    tag: {
      type: String,
      default: 'span',
    },
    custom: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    this.setupValidation();
  },
  updated() {
    this.setupValidation();
  },
  methods: {
    setupValidation() {
      if (!this.state) {
        return;
      }
      // Find all named form elements
      const elements = this.$el.querySelectorAll('[name]');
      for (const el of elements) {
        this.initField(el);
      }
    },
    initField(el) {
      const name = el.name;
      if (!name || !this.state) {
        return;
      }

      if (!this.state[name]) {
        this.state[name] = {
          $valid: true,
          $invalid: false,
          $touched: false,
          $dirty: false,
          $submitted: false,
          $error: {},
          $attrs: {},
        };
      }

      el.addEventListener('blur', () => {
        this.state[name].$touched = true;
        this.validate(el, name);
      });
      el.addEventListener('input', () => {
        this.state[name].$dirty = true;
        this.validate(el, name);
      });
      el.addEventListener('change', () => {
        this.state[name].$dirty = true;
        this.validate(el, name);
      });
    },
    validate(el, name) {
      if (!this.state || !this.state[name]) {
        return;
      }

      const errors = {};

      // HTML5 native validation
      if (el.validity) {
        if (el.validity.valueMissing) {
          errors['required'] = true;
        }
        if (el.validity.typeMismatch && el.type === 'email') {
          errors['email'] = true;
        }
        if (el.validity.typeMismatch && el.type === 'url') {
          errors['url'] = true;
        }
        if (el.validity.patternMismatch) {
          errors['pattern'] = true;
        }
        if (el.validity.tooShort) {
          errors['minlength'] = true;
        }
        if (el.validity.tooLong) {
          errors['maxlength'] = true;
        }
        if (el.validity.rangeUnderflow) {
          errors['min'] = true;
        }
        if (el.validity.rangeOverflow) {
          errors['max'] = true;
        }
        if (el.validity.stepMismatch) {
          errors['step'] = true;
        }
        if (el.validity.badInput) {
          errors['number'] = true;
        }
      }

      // Update $attrs from element attributes
      const attrs = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      this.state[name].$attrs = attrs;

      // Custom validators
      const value = el.value;
      for (const [validatorName, validatorFn] of Object.entries(this.custom || {})) {
        const attrValue = el.getAttribute(`data-${validatorName}`) ?? el.getAttribute(validatorName) ?? '';
        const result = validatorFn(value, attrValue, null);
        if (result === false) {
          errors[validatorName] = true;
        }
      }

      this.state[name].$error = errors;
      this.state[name].$valid = Object.keys(errors).length === 0;
      this.state[name].$invalid = !this.state[name].$valid;
      this.state[name].$submitted = this.state.$submitted || false;

      // Update overall form state
      this.updateFormState();
    },
    updateFormState() {
      if (!this.state) {
        return;
      }

      const fieldStates = Object.entries(this.state).filter(
        ([key]) => !key.startsWith('$'),
      ).map(([, fieldState]) => fieldState);

      const allValid = fieldStates.every((f) => f.$valid !== false);
      this.state.$valid = allValid;
      this.state.$invalid = !allValid;
      this.state.$error = {};

      for (const [key, fieldState] of Object.entries(this.state)) {
        if (!key.startsWith('$') && fieldState.$invalid) {
          this.state.$error[key] = true;
        }
      }
    },
  },
};
</script>
