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
    autoFocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    value: {
      type: null,
      required: true,
    },
  },
  data() {
    return {
      localValue: this.value ? String(this.value) : ``,
    };
  },
  computed: {
    /**
     * @public
     * @returns {Record.<String, String | null>} Validation data for vue-form
     */
    validationData() {
      return {
        minlength: `minLength` in this.schemaProperty ? `${this.schemaProperty.minLength}` : null,
        maxlength: `maxLength` in this.schemaProperty ? `${this.schemaProperty.maxLength}` : null,
      };
    },
  },
  mounted() {
    if (this.autoFocus) {
      this.focus();
    }

    this.$watch(`validationData`, function(newValidationData) {
      this.$emit(`vf:validate`, newValidationData);
    }, {
      deep: true,
      immediate: true,
    });
  },
  methods: {
    focus() {
      this.$el.focus();
    },
    update() {
      this.$emit(`input`, this.localValue);
    },
  },
};
</script>
