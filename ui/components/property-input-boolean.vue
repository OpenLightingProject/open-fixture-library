<template>
  <select
    ref="input"
    v-model="localValue"
    :required="required"
    :class="{boolean: true, empty: value === null}">
    <option :value="null" :disabled="required">unknown</option>
    <option :value="true">yes</option>
    <option :value="false">no</option>
  </select>
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
    additionHint: {
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
      type: Boolean,
      required: false,
      default: null
    }
  },
  computed: {
    localValue: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit(`input`, newValue);
      }
    }
  },
  mounted() {
    if (this.autoFocus) {
      this.focus();
    }
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    }
  }
};
</script>

