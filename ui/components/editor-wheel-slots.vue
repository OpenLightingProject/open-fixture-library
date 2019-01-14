<template>
  <div class="capability-wheel-slots">
    <app-editor-wheel-slot
      v-for="slotNumber in slotDetailNumbers"
      :key="slotNumber"
      :channel="channel"
      :slot-number="slotNumber"
      :formstate="formstate" />
  </div>
</template>

<style lang="scss" scoped>
/deep/ details:nth-last-of-type(1):not([open]) {
  margin-bottom: 1rem;
}
</style>

<script>
import editorWheelSlotVue from '~/components/editor-wheel-slot.vue';

export default {
  components: {
    'app-editor-wheel-slot': editorWheelSlotVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    channel: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    slotDetailNumbers() {
      const slotNumbers = [
        this.capability.typeData.slotNumber,
        this.capability.typeData.slotNumberStart,
        this.capability.typeData.slotNumberEnd
      ].filter(slotNumber => typeof slotNumber === `number`);

      if (slotNumbers.length === 0) {
        return [];
      }

      const min = Math.floor(Math.min(...slotNumbers));
      const max = Math.ceil(Math.max(...slotNumbers));
      const length = max - min + 1;

      // array of integers from min to max: [min, min+1, …, max-1, max]
      const slotNumbersInRange = Array.apply(null, Array(length)).map(
        (item, index) => min + index
      ).filter(slotNumber => slotNumber >= 1);

      if (slotNumbers[slotNumbers.length - 1] < slotNumbers[0]) {
        slotNumbersInRange.reverse();
      }

      return slotNumbersInRange;
    }
  }
};
</script>
