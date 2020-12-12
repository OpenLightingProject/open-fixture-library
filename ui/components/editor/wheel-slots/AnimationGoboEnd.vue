<template>
  <div class="wheel-slot-type-data" />
</template>

<script>
export default {
  props: {
    wheelSlot: { // eslint-disable-line vue/no-unused-properties
      type: Object,
      required: true,
    },
    formstate: { // eslint-disable-line vue/no-unused-properties
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      /** Used in {@link EditorCapabilityTypeData} */
      defaultData: {}, // eslint-disable-line vue/no-unused-properties
    };
  },
};
</script>
