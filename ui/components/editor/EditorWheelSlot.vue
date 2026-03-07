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
import { wheelSlotTypes } from '~~/lib/schema-properties.js';
import { getEmptyWheelSlot } from '@/assets/scripts/editor-utilities.js';

interface Props {
  channel: {
    name: string;
    wheel?: {
      slots: Array<{
        type: string;
        typeData: Record<string, any>;
      }>;
    };
  };
  slotNumber: number;
  formstate?: object;
}

const props = defineProps<Props>();

const typeData = ref<any>(null);
const open = ref(false);

const slotTypes = Object.keys(wheelSlotTypes);

const slot = computed(() => {
  return props.channel.wheel?.slots[props.slotNumber - 1];
});

const suggestedType = computed(() => {
  const previousSlot = props.channel.wheel?.slots[props.slotNumber - 2];
  if (previousSlot && previousSlot.type === 'AnimationGoboStart') {
    return 'AnimationGoboEnd';
  }

  if (props.slotNumber === 1) {
    return /\banimation\b/i.test(props.channel.name) ? 'AnimationGoboStart' : 'Open';
  }

  return slotTypes.find(type => props.channel.name.toLowerCase().includes(type.toLowerCase())) || '';
});

const animationGoboEndAfterStart = computed(() => {
  if (slot.value?.type !== 'AnimationGoboEnd') {
    return true;
  }

  if (props.slotNumber === 1) {
    return false;
  }

  const previousSlot = props.channel.wheel?.slots[props.slotNumber - 2];
  return !previousSlot || previousSlot.type === 'AnimationGoboStart';
});

const animationGoboEndValid = computed(() => {
  const previousSlot = props.channel.wheel?.slots[props.slotNumber - 2];
  return !previousSlot || previousSlot.type !== 'AnimationGoboStart' || slot.value?.type === 'AnimationGoboEnd';
});

watch(
  () => props.slotNumber,
  async (newSlotNumber) => {
    if (!props.channel.wheel?.slots[newSlotNumber - 1]) {
      props.channel.wheel.slots[newSlotNumber - 1] = getEmptyWheelSlot();
      open.value = true;

      await nextTick();
      if (slot.value) {
        slot.value.type = suggestedType.value;
      }
    }
  },
  { immediate: true }
);

async function changeSlotType() {
  await nextTick();

  if (typeData.value) {
    const defaultData = typeData.value.defaultData;
    for (const property of Object.keys(defaultData)) {
      if (!(property in slot.value.typeData)) {
        slot.value.typeData[property] = defaultData[property];
      }
    }
  }
}

defineExpose({});
</script>
