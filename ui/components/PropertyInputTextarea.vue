<template>
  <textarea
    v-model.trim="localValue"
    :required="required"
    :placeholder="hint"
    :minlength="schemaProperty.minLength"
    :maxlength="schemaProperty.maxLength"
    @input="update()" />
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
  },
};
</script>
