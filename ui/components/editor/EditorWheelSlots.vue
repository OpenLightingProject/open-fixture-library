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
:deep(details:nth-last-of-type(1):not([open])) {
  margin-bottom: 1rem;
}
</style>

<script setup lang="ts">
import type { EditorChannel } from '~/types/editor';

type SlotNumber = string | number | null;

interface Properties {
  capability: {
    typeData: {
      slotNumber?: SlotNumber;
      slotNumberStart?: SlotNumber;
      slotNumberEnd?: SlotNumber;
    };
  };
  channel: EditorChannel;
  formstate?: object;
}

const properties = defineProps<Properties>();

const slotDetailNumbers = computed(() => {
  const slotNumbers = [
    properties.capability.typeData.slotNumber,
    properties.capability.typeData.slotNumberStart,
    properties.capability.typeData.slotNumberEnd,
  ].filter((slotNumber): slotNumber is number => typeof slotNumber === 'number');

  if (slotNumbers.length === 0) {
    return [];
  }

  const min = Math.floor(Math.min(...slotNumbers));
  const max = Math.ceil(Math.max(...slotNumbers));
  const length = max - min + 1;

  const slotNumbersInRange = Array.from({ length }, (item, index) => min + index).filter((slotNumber) => slotNumber >= 1);

  if (slotNumbers.at(-1)! < slotNumbers[0]) {
    slotNumbersInRange.reverse();
  }

  return slotNumbersInRange;
});
</script>
