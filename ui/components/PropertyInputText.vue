<template>
  <input
    v-model.trim="localValue"
    :required="required"
    :placeholder="hint"
    :pattern="schemaProperty.pattern"
    :minlength="schemaProperty.minLength"
    :maxlength="schemaProperty.maxLength"
    type="text"
    @input="update()"
    @blur="onBlur()">
</template>

<script>
import { anyProp, booleanProp, objectProp, stringProp } from 'vue-ts-types';

export default {
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    hint: stringProp().optional,
    value: anyProp().required,
  },
  emits: {
    input: value => true,
    blur: value => true,
    'vf:validate': validationData => true,
  },
  data() {
    return {
      localValue: ``,
    };
  },
  computed: {
    /**
     * @public
     * @returns {Record<string, string | null>} Validation data for vue-form
     */
    validationData() {
      return {
        pattern: `pattern` in this.schemaProperty ? `${this.schemaProperty.pattern}` : null,
        minlength: `minLength` in this.schemaProperty ? `${this.schemaProperty.minLength}` : null,
        maxlength: `maxLength` in this.schemaProperty ? `${this.schemaProperty.maxLength}` : null,
      };
    },
  },
  watch: {
    value: {
      handler(newValue) {
        this.localValue = newValue ? String(newValue) : ``;
      },
      immediate: true,
    },
    validationData: {
      handler(newValidationData) {
        this.$emit(`vf:validate`, newValidationData);
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
      this.$emit(`input`, this.localValue);
    },
    async onBlur() {
      await this.$nextTick();
      this.$emit(`blur`, this.localValue);
    },
  },
};
</script>
