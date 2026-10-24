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
interface Props {
  capability: {
    typeData: {
      slotNumber?: number;
      slotNumberStart?: number;
      slotNumberEnd?: number;
    };
  };
  channel: {
    wheel?: {
      slots?: Array<{ type: string }>;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();

const slotDetailNumbers = computed(() => {
  const slotNumbers = [
    props.capability.typeData.slotNumber,
    props.capability.typeData.slotNumberStart,
    props.capability.typeData.slotNumberEnd,
  ].filter(slotNumber => typeof slotNumber === 'number');

  if (slotNumbers.length === 0) {
    return [];
  }

  const min = Math.floor(Math.min(...slotNumbers));
  const max = Math.ceil(Math.max(...slotNumbers));
  const length = max - min + 1;

  const slotNumbersInRange = Array.from({ length }, (item, index) => min + index).filter(slotNumber => slotNumber >= 1);

  if ((slotNumbers as number[]).at(-1) as number < (slotNumbers as number[])[0]) {
    slotNumbersInRange.reverse();
  }

  return slotNumbersInRange;
});
</script>
