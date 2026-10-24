<template>
  <form v-bind="formAttrs" @submit.prevent="onSubmit($event)">
    <slot />
  </form>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    state: {
      type: Object,
      required: true,
    },
  },
  emits: ['submit'],
  computed: {
    formAttrs() {
      const { onSubmit, ...rest } = this.$attrs;
      return rest;
    },
  },
  methods: {
    onSubmit(event) {
      this.state.$submitted = true;
      this.$emit('submit', event);
    },
  },
};
</script>
