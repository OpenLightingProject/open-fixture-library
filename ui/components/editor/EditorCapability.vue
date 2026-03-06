<template>
  <ConditionalDetails :open="capability.open" class="capability">
    <template #summary>
      DMX range
      <code :class="{ unset: start === null }">{{ start === null ? min : start }}</code> …
      <code :class="{ unset: end === null }">{{ end === null ? max : end }}</code>:
      <span :class="{ unset: capability.type === `` }">{{ capability.type || 'Unset' }}</span>
    </template>

    <div class="capability-content">

      <LabeledInput
        :formstate="formstate"
        multiple-inputs
        :name="`capability${capability.uuid}-dmxRange`"
        label="DMX range">

        <PropertyInputRange
          ref="firstInput"
          v-model="capability.dmxRange"
          :formstate="formstate"
          :name="`capability${capability.uuid}-dmxRange`"
          :schema-property="capabilityDmxRange"
          :range-min="min"
          :range-max="max"
          :start-hint="capabilities.length === 1 ? `${min}` : `start`"
          :end-hint="capabilities.length === 1 ? `${max}` : `end`"
          :required="capabilities.length > 1"
          @start-updated="onStartUpdated()"
          @end-updated="onEndUpdated()" />

      </LabeledInput>

      <button
        v-if="isChanged"
        type="button"
        class="close icon-button"
        title="Remove capability"
        @click.prevent="clear()">
        <OflSvg name="close" />
      </button>

      <EditorCapabilityTypeData
        ref="capabilityTypeData"
        :capability="capability"
        :channel="channel"
        :formstate="formstate"
        required />

    </div>
  </ConditionalDetails>
</template>

<style lang="scss" scoped>
.capability {
  position: relative;
  margin: 0 -0.5rem;

  &:not(:last-child) {
    border-bottom: 1px solid theme-color(divider);
  }

  &[open] {
    padding-bottom: 1.5rem;
    margin-bottom: 0.8rem;
  }

  & :deep(summary) {
    padding: 0.3rem 0.5rem;
  }
}

.capability-content {
  padding: 0 1.5rem;
}

.unset {
  color: theme-color(text-disabled);
}

.icon-button.close {
  position: absolute;
  top: 0;
  right: 0;
}
</style>

<script setup lang="ts">
import { capabilityDmxRange } from '~~/lib/schema-properties.js';
import { getEmptyCapability, isCapabilityChanged } from '@/assets/scripts/editor-utilities.js';

interface Props {
  channel: {
    capabilities: Array<{
      dmxRange: [number, number] | null;
      type: string;
      typeData: Record<string, any>;
      open?: boolean;
    }>;
  };
  capabilityIndex: number;
  resolution: number;
  formstate: object;
}

const props = defineProps<Props>();

const firstInput = ref<any>(null);
const capabilityTypeData = ref<any>(null);

const capabilities = computed(() => props.channel.capabilities);

const capability = computed(() => capabilities.value[props.capabilityIndex]);

const dmxMax = computed(() => Math.pow(256, props.resolution) - 1);

const isChanged = computed(() => {
  return capabilities.value.some(
    capability => isCapabilityChanged(capability),
  );
});

const start = computed(() => {
  return capability.value.dmxRange === null ? null : capability.value.dmxRange[0];
});

const end = computed(() => {
  return capability.value.dmxRange === null ? null : capability.value.dmxRange[1];
});

const min = computed(() => {
  let minVal = 0;
  let index = props.capabilityIndex - 1;
  while (index >= 0) {
    const capability = capabilities.value[index];
    if (capability.dmxRange !== null) {
      if (capability.dmxRange[1]) {
        minVal = capability.dmxRange[1] + 1;
        break;
      }
      if (capability.dmxRange[0] !== null) {
        minVal = capability.dmxRange[0] + 1;
        break;
      }
    }
    index--;
  }
  return minVal;
});

const max = computed(() => {
  let maxVal = dmxMax.value;
  let index = props.capabilityIndex + 1;
  while (index < capabilities.value.length) {
    const capability = capabilities.value[index];
    if (capability.dmxRange !== null) {
      if (capability.dmxRange[0] !== null) {
        maxVal = capability.dmxRange[0] - 1;
        break;
      }
      if (capability.dmxRange[1] !== null) {
        maxVal = capability.dmxRange[1] - 1;
        break;
      }
    }
    index++;
  }
  return maxVal;
});

function onStartUpdated() {
  if (start.value === null) {
    const previousCapability = capabilities.value[props.capabilityIndex - 1];
    if (previousCapability && !isCapabilityChanged(previousCapability)) {
      removePreviousCapability();
    }
    return;
  }

  const previousCapability = capabilities.value[props.capabilityIndex - 1];
  if (previousCapability) {
    if (isCapabilityChanged(previousCapability)) {
      if (start.value > min.value) {
        insertCapabilityBefore();
      }
      return;
    }

    if (start.value <= min.value) {
      removePreviousCapability();
    }
    return;
  }

  if (start.value > 0) {
    insertCapabilityBefore();
  }
}

function onEndUpdated() {
  if (end.value === null) {
    const nextCapability = capabilities.value[props.capabilityIndex + 1];
    if (nextCapability && !isCapabilityChanged(nextCapability)) {
      removeNextCapability();
    }
    return;
  }

  const nextCapability = capabilities.value[props.capabilityIndex + 1];
  if (nextCapability) {
    if (isCapabilityChanged(nextCapability)) {
      if (end.value < max.value) {
        insertCapabilityAfter();
      }
      return;
    }

    if (end.value >= max.value) {
      removeNextCapability();
    }
    return;
  }

  if (end.value < dmxMax.value) {
    insertCapabilityAfter();
  }
}

function clear() {
  const emptyCapability = getEmptyCapability();
  for (const property of Object.keys(emptyCapability)) {
    capability.value[property as keyof typeof capability.value] = emptyCapability[property as keyof typeof emptyCapability];
  }
  collapseWithNeighbors();
}

function collapseWithNeighbors() {
  const previousCapability = capabilities.value[props.capabilityIndex - 1];
  const nextCapability = capabilities.value[props.capabilityIndex + 1];

  if (previousCapability && !isCapabilityChanged(previousCapability)) {
    if (nextCapability && !isCapabilityChanged(nextCapability)) {
      removePreviousCapability();
      removeCurrentCapability();
      return;
    }

    removePreviousCapability();
    return;
  }

  if (nextCapability && !isCapabilityChanged(nextCapability)) {
    removeNextCapability();
  }
}

async function insertCapabilityBefore() {
  const dialog = null;
  await nextTick();

  const newCapability = null;
  if (dialog) {
    const capabilityEditor = dialog.querySelector('.capability-editor');
    if (capabilityEditor) {
      const newCap = capabilityEditor.children[props.capabilityIndex - 1];
      if (newCap) {
        dialog.scrollTop += newCap.clientHeight;
      }
    }
  }
}

function insertCapabilityAfter() {
}

function removePreviousCapability() {
  capabilities.value.splice(props.capabilityIndex - 1, 1);
}

function removeCurrentCapability() {
  capabilities.value.splice(props.capabilityIndex, 1);
}

function removeNextCapability() {
  capabilities.value.splice(props.capabilityIndex + 1, 1);
}

function cleanCapabilityData() {
  if (capability.value.dmxRange === null) {
    capability.value.dmxRange = [null, null];
  }
  if (capability.value.dmxRange[0] === null) {
    capability.value.dmxRange[0] = min.value;
  }
  if (capability.value.dmxRange[1] === null) {
    capability.value.dmxRange[1] = max.value;
  }

  capabilityTypeData.value?.cleanCapabilityData();
}

function focus() {
  firstInput.value?.focus();
}

defineExpose({ cleanCapabilityData, focus });
</script>
