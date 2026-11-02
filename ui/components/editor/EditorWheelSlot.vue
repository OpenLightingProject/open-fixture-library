<template>
  <ConditionalDetails class="editor-wheel-slot" :open="open">
    <template #summary>Details for wheel slot {{ slotNumber }}</template>

    <div class="wheel-slot-content">
      <LabeledInput
        :formstate="formstate"
        :custom-validators="{
          'animation-gobo-end-without-start': animationGoboEndAfterStart,
          'must-be-animation-gobo-end': animationGoboEndValid,
        }"
        :name="`wheel-slot${slot.uuid}-type`"
        label="Slot type">
        <!-- eslint-disable-next-line vuejs-accessibility/no-onchange -- @change is fine here, as the action is non-destructive -->
        <select
          v-model="slot.type"
          :class="{ empty: slot.type === `` }"
          :name="`wheel-slot${slot.uuid}-type`"
          required
          @change="changeSlotType()">

          <option value="" disabled>Please select a slot type</option>

          <option
            v-for="type of slotTypes"
            :key="type"
            :value="type">{{ type }}</option>

        </select>
      </LabeledInput>

      <Component
        :is="`WheelSlot${slot.type}`"
        v-if="slot.type !== ``"
        ref="typeData"
        :wheel-slot="slot"
        :formstate="formstate" />
    </div>
  </ConditionalDetails>
</template>

<style lang="scss" scoped>
.wheel-slot-content {
  padding: 0 1.5rem;
}
</style>

<script setup lang="ts">
import { getEmptyWheelSlot } from '@/assets/scripts/editor-utilities.js';
import type { EditorChannel } from '~/types/editor';
import { wheelSlotTypes } from '~~/lib/schema-properties.js';
import WheelSlotAnimationGoboEnd from './wheel-slots/WheelSlotAnimationGoboEnd.vue';
import WheelSlotAnimationGoboStart from './wheel-slots/WheelSlotAnimationGoboStart.vue';
import WheelSlotClosed from './wheel-slots/WheelSlotClosed.vue';
import WheelSlotColor from './wheel-slots/WheelSlotColor.vue';
import WheelSlotFrost from './wheel-slots/WheelSlotFrost.vue';
import WheelSlotGobo from './wheel-slots/WheelSlotGobo.vue';
import WheelSlotIris from './wheel-slots/WheelSlotIris.vue';
import WheelSlotOpen from './wheel-slots/WheelSlotOpen.vue';
import WheelSlotPrism from './wheel-slots/WheelSlotPrism.vue';

interface Properties {
  channel: EditorChannel;
  slotNumber: number;
  formstate?: object;
}

const properties = defineProps<Properties>();

defineOptions({
  components: {
    WheelSlotAnimationGoboEnd,
    WheelSlotAnimationGoboStart,
    WheelSlotClosed,
    WheelSlotColor,
    WheelSlotFrost,
    WheelSlotGobo,
    WheelSlotIris,
    WheelSlotOpen,
    WheelSlotPrism,
  },
});

const typeData = ref<any>(null);
const open = ref(false);

const slotTypes = Object.keys(wheelSlotTypes);

const slot = computed(() => {
  return properties.channel.wheel?.slots[properties.slotNumber - 1];
});

const suggestedType = computed(() => {
  const previousSlot = properties.channel.wheel?.slots[properties.slotNumber - 2];
  if (previousSlot && previousSlot.type === 'AnimationGoboStart') {
    return 'AnimationGoboEnd';
  }

  if (properties.slotNumber === 1) {
    return /\banimation\b/i.test(properties.channel.name) ? 'AnimationGoboStart' : 'Open';
  }

  return slotTypes.find((type) => properties.channel.name.toLowerCase().includes(type.toLowerCase())) || '';
});

const animationGoboEndAfterStart = computed(() => {
  if (slot.value?.type !== 'AnimationGoboEnd') {
    return true;
  }

  if (properties.slotNumber === 1) {
    return false;
  }

  const previousSlot = properties.channel.wheel?.slots[properties.slotNumber - 2];
  return !previousSlot || previousSlot.type === 'AnimationGoboStart';
});

const animationGoboEndValid = computed(() => {
  const previousSlot = properties.channel.wheel?.slots[properties.slotNumber - 2];
  return !previousSlot || previousSlot.type !== 'AnimationGoboStart' || slot.value?.type === 'AnimationGoboEnd';
});

watch(
  () => properties.slotNumber,
  async (newSlotNumber) => {
    if (properties.channel.wheel?.slots[newSlotNumber - 1]) {
      return;
    }

    properties.channel.wheel.slots[newSlotNumber - 1] = getEmptyWheelSlot();
    open.value = true;

    await nextTick();
    if (slot.value) {
      slot.value.type = suggestedType.value;
    }
  },
  { immediate: true },
);

/**
 * Merges default data for newly selected wheel slot properties.
 */
async function changeSlotType() {
  await nextTick();

  if (!typeData.value) {
    return;
  }

  const defaultData = typeData.value.defaultData;
  for (const [property, value] of Object.entries(defaultData)) {
    if (!(property in slot.value.typeData)) {
      slot.value.typeData[property] = value;
    }
  }
}
</script>
