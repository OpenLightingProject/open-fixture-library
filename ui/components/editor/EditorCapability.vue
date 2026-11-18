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
import { getEmptyCapability, isCapabilityChanged } from '@/assets/scripts/editor-utilities.js';
import { capabilityDmxRange } from '~~/lib/schema-properties.js';

interface Properties {
  channel: {
    capabilities: Array<{
      uuid: string;
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

const properties = defineProps<Properties>();
const emit = defineEmits<{
  'insert-capability-before': [];
  'insert-capability-after': [];
}>();

const instance = getCurrentInstance();

const firstInput = ref<any>(null);
const capabilityTypeData = ref<any>(null);

const capabilities = computed(() => properties.channel.capabilities);

const capability = computed(() => capabilities.value[properties.capabilityIndex]);

const dmxMax = computed(() => Math.pow(256, properties.resolution) - 1);

const isChanged = computed(() => {
  return capabilities.value.some(
    (otherCapability) => isCapabilityChanged(otherCapability),
  );
});

const start = computed(() => {
  return capability.value.dmxRange === null ? null : capability.value.dmxRange[0];
});

const end = computed(() => {
  return capability.value.dmxRange === null ? null : capability.value.dmxRange[1];
});

const min = computed(() => {
  let minValue = 0;
  let index = properties.capabilityIndex - 1;
  while (index >= 0) {
    const previousCapability = capabilities.value[index];
    if (previousCapability.dmxRange !== null) {
      if (previousCapability.dmxRange[1]) {
        minValue = previousCapability.dmxRange[1] + 1;
        break;
      }
      if (previousCapability.dmxRange[0] !== null) {
        minValue = previousCapability.dmxRange[0] + 1;
        break;
      }
    }
    index--;
  }
  return minValue;
});

const max = computed(() => {
  let maxValue = dmxMax.value;
  let index = properties.capabilityIndex + 1;
  while (index < capabilities.value.length) {
    const nextCapability = capabilities.value[index];
    if (nextCapability.dmxRange !== null) {
      if (nextCapability.dmxRange[0] !== null) {
        maxValue = nextCapability.dmxRange[0] - 1;
        break;
      }
      if (nextCapability.dmxRange[1] !== null) {
        maxValue = nextCapability.dmxRange[1] - 1;
        break;
      }
    }
    index++;
  }
  return maxValue;
});

/**
 * Inserts or merges neighboring capabilities when the start DMX value changes.
 */
function onStartUpdated() {
  if (start.value === null) {
    const previousCapability = capabilities.value[properties.capabilityIndex - 1];
    if (previousCapability && !isCapabilityChanged(previousCapability)) {
      removePreviousCapability();
    }
    return;
  }

  const previousCapability = capabilities.value[properties.capabilityIndex - 1];
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

/**
 * Inserts or merges neighboring capabilities when the end DMX value changes.
 */
function onEndUpdated() {
  if (end.value === null) {
    const nextCapability = capabilities.value[properties.capabilityIndex + 1];
    if (nextCapability && !isCapabilityChanged(nextCapability)) {
      removeNextCapability();
    }
    return;
  }

  const nextCapability = capabilities.value[properties.capabilityIndex + 1];
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

/**
 * Resets the capability to its empty state and collapses empty neighbors.
 */
function clear() {
  const emptyCapability = getEmptyCapability();
  for (const [property, value] of Object.entries(emptyCapability)) {
    (capability.value as Record<string, unknown>)[property] = value;
  }
  collapseWithNeighbors();
}

/**
 * Removes adjacent capabilities that have no user-entered data.
 */
function collapseWithNeighbors() {
  const previousCapability = capabilities.value[properties.capabilityIndex - 1];
  const nextCapability = capabilities.value[properties.capabilityIndex + 1];

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

/**
 * Inserts an empty capability before this one and keeps the dialog scrolled.
 */
async function insertCapabilityBefore() {
  emit('insert-capability-before');

  const element = instance?.proxy?.$el as HTMLElement | undefined;
  const dialog = element?.closest('.dialog') as HTMLElement | null;
  await nextTick();

  const newCapability = dialog?.querySelector('.capability-editor')?.children[properties.capabilityIndex - 1];
  if (dialog && newCapability) {
    dialog.scrollTop += (newCapability as HTMLElement).clientHeight;
  }
}

/**
 * Inserts an empty capability after this one.
 */
function insertCapabilityAfter() {
  emit('insert-capability-after');
}

/**
 * Removes the capability before this one.
 */
function removePreviousCapability() {
  capabilities.value.splice(properties.capabilityIndex - 1, 1);
}

/**
 * Removes this capability.
 */
function removeCurrentCapability() {
  capabilities.value.splice(properties.capabilityIndex, 1);
}

/**
 * Removes the capability after this one.
 */
function removeNextCapability() {
  capabilities.value.splice(properties.capabilityIndex + 1, 1);
}

/**
 * Fills in default DMX range bounds before the capability is saved.
 */
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

/**
 * Focuses the capability's first input.
 */
function focus() {
  firstInput.value?.focus();
}

defineExpose({
  cleanCapabilityData,
  focus,
  getElement: () => instance?.proxy?.$el as HTMLElement | undefined,
  onEndUpdated,
});
</script>
