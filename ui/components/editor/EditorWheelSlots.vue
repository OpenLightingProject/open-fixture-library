<template>
  <div class="capability-wheel-slots">
    <EditorWheelSlot
      v-for="slotNumber of slotDetailNumbers"
      :key="slotNumber"
      :channel="channel"
      :slot-number="slotNumber"
      :formstate="formstate" />
  </div>
</template>

<style lang="scss" scoped>
::v-deep details:nth-last-of-type(1):not([open]) {
  margin-bottom: 1rem;
}
</style>

<script>
import { objectProp } from 'vue-ts-types';
import EditorWheelSlot from './EditorWheelSlot.vue';

export default {
  components: {
    EditorWheelSlot,
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
    formstate: objectProp().optional,
  },
  computed: {
    slotDetailNumbers() {
      const slotNumbers = [
        this.capability.typeData.slotNumber,
        this.capability.typeData.slotNumberStart,
        this.capability.typeData.slotNumberEnd,
      ].filter(slotNumber => typeof slotNumber === `number`);

      if (slotNumbers.length === 0) {
        return [];
      }

      const min = Math.floor(Math.min(...slotNumbers));
      const max = Math.ceil(Math.max(...slotNumbers));
      const length = max - min + 1;

      // array of integers from min to max: [min, min+1, …, max-1, max]
      const slotNumbersInRange = Array.from({ length }, (item, index) => min + index).filter(slotNumber => slotNumber >= 1);

      if (slotNumbers.at(-1) < slotNumbers[0]) {
        slotNumbersInRange.reverse();
      }

      return slotNumbersInRange;
    },
  },
};
</script>
