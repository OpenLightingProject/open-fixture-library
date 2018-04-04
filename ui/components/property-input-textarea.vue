<template>
  <textarea
    ref="input"
    :required="required"
    :placeholder="hint"
    :minlength="schemaProperty.minLength"
    :maxlength="schemaProperty.maxLength"
    :value="value"
    @input="update" />
</template>

<script>
export default {
  props: {
    schemaProperty: {
      type: Object,
      required: true
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    hint: {
      type: String,
      required: false,
      default: null
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false
    },
    value: {
      type: null,
      required: true
    }
  },
  computed: {
    validationData() {
      return {
        minlength: `minLength` in this.schemaProperty ? `${this.schemaProperty.minLength}` : null,
        maxlength: `maxLength` in this.schemaProperty ? `${this.schemaProperty.maxLength}` : null
      };
    }
  },
  mounted() {
    if (this.autoFocus) {
      this.focus();
    }

    this.$watch(`validationData`, function(newValidationData) {
      this.$emit(`vf:validate`, newValidationData);
    }, {
      deep: true,
      immediate: true
    });
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    },
    update() {
      this.$emit(`input`, this.$refs.input.value);
    }
  }
};
</script>

