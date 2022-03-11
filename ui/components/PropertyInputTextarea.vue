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
export default {
  props: {
    schemaProperty: {
      type: Object,
      required: true,
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    hint: {
      type: String,
      required: false,
      default: null,
    },
    value: {
      type: null,
      required: true,
    },
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
