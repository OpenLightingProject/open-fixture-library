<template>
  <div class="wheel-slot-type-data" />
</template>

<script>
export default {
  props: {
    wheelSlot: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      defaultData: {}
    };
  }
};
</script>
