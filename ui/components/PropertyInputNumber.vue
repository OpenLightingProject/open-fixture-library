<template>
  <input
    :required="required"
    :min="min"
    :max="max"
    :data-exclusive-minimum="exclusiveMinimum"
    :data-exclusive-maximum="exclusiveMaximum"
    :step="step"
    :placeholder="hint"
    :value="value === `invalid` ? `` : value"
    type="number"
    v-on="lazy ? { change: update } : { input: update }"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)">
</template>

<script>
import { anyProp, booleanProp, numberProp, objectProp, oneOfTypesProp, stringProp } from 'vue-ts-types';

export default {
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    hint: stringProp().optional,
    minimum: oneOfTypesProp([Number, String]).optional, // can be the string `invalid`
    maximum: oneOfTypesProp([Number, String]).optional, // can be the string `invalid`
    value: anyProp().required,
    lazy: booleanProp().withDefault(false),
    stepOverride: numberProp().optional,
  },
  emits: {
    'input': (value) => true,
    'focus': () => true,
    'blur': () => true,
    'vf:validate': (validationData) => true,
  },
  computed: {
    min() {
      if (this.minimum !== undefined && this.minimum !== 'invalid') {
        return this.minimum;
      }

      return 'minimum' in this.schemaProperty ? this.schemaProperty.minimum : this.exclusiveMinimum;
    },
    max() {
      if (this.maximum !== undefined && this.maximum !== 'invalid') {
        return this.maximum;
      }

      return 'maximum' in this.schemaProperty ? this.schemaProperty.maximum : this.exclusiveMaximum;
    },
    exclusiveMinimum() {
      return 'exclusiveMinimum' in this.schemaProperty ? this.schemaProperty.exclusiveMinimum : null;
    },
    exclusiveMaximum() {
      return 'exclusiveMaximum' in this.schemaProperty ? this.schemaProperty.exclusiveMaximum : null;
    },
    step() {
      if (this.stepOverride !== undefined) {
        return this.stepOverride;
      }
      return this.schemaProperty.type === 'integer' ? 1 : 'any';
    },

    /**
     * @public
     * @returns {Record<string, string | null>} Validation data for vue-form
     */
    validationData() {
      return {
        'min': this.min === null ? null : String(this.min),
        'max': this.max === null ? null : String(this.max),
        'data-exclusive-minimum': this.exclusiveMinimum === null ? null : String(this.exclusiveMinimum),
        'data-exclusive-maximum': this.exclusiveMaximum === null ? null : String(this.exclusiveMaximum),
        'step': String(this.step),
        'type': 'number',
      };
    },
  },
  watch: {
    validationData: {
      handler(newValidationData) {
        this.$emit('vf:validate', newValidationData);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    /** @public */
    focus() {
      this.$el.focus();
    },
    update() {
      const input = this.$el;
      if (input.validity && input.validity.badInput) {
        this.$emit('input', 'invalid');
        return;
      }

      if (input.value === '') {
        this.$emit('input', null);
        return;
      }

      let value;
      try {
        value = Number.parseFloat(input.value);
      }
      catch {
        value = 'invalid';
      }

      this.$emit('input', value);
    },
  },
};
</script>
