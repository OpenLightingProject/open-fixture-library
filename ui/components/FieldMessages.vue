<template>
  <component :is="tag">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData || {}" />
    </template>
  </component>
</template>

<script>
export default {
  props: {
    state: {
      type: Object,
      default: null,
    },
    name: {
      type: String,
      default: '',
    },
    show: {
      type: String,
      default: '',
    },
    tag: {
      type: String,
      default: 'div',
    },
  },
  computed: {
    fieldState() {
      if (!this.state || !this.name) {
        return null;
      }
      return this.state[this.name] || null;
    },
    shouldShow() {
      if (!this.fieldState) {
        return false;
      }
      const showConditions = this.show.split(',').map((s) => s.trim());
      return showConditions.some((cond) => {
        if (cond === '$submitted') {
          return this.state.$submitted || false;
        }
        if (cond === '$dirty') {
          return this.fieldState.$dirty || false;
        }
        if (cond === '$touched') {
          return this.fieldState.$touched || false;
        }
        return false;
      });
    },
  },
};
</script>
