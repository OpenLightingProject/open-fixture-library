<template>
  <div class="capability-wizard">

    <span>Generate multiple capabilities with same range width. Occurrences of '#' in text fields will be replaced by an increasing number.</span>

    <section>
      <label>
        <LabeledValue label="DMX start value">
          <input
            ref="firstInput"
            v-model.number="wizard.start"
            :max="dmxMax"
            type="number"
            min="0"
            step="1">
        </LabeledValue>
      </label>
    </section>

    <section>
      <label>
        <LabeledValue label="Range width">
          <input
            v-model.number="wizard.width"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </LabeledValue>
      </label>
    </section>

    <section>
      <label>
        <LabeledValue label="Count">
          <input
            v-model.number="wizard.count"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </LabeledValue>
      </label>
    </section>

    <EditorCapabilityTypeData
      :capability="wizard.templateCapability"
      :channel="channel" />

    <table class="capabilities-table">
      <colgroup>
        <col style="width: 5.8ex;">
        <col style="width: 1ex;">
        <col style="width: 5.8ex;">
        <col>
      </colgroup>
      <thead><tr>
        <th colspan="3" style="text-align: center;">DMX values</th>
        <th>Capability</th>
      </tr></thead>
      <tbody>
        <tr v-for="capability of allCapabilities" :key="capability.uuid" :class="capability.source">
          <td class="capability-dmx-range-start"><code>{{ capability.dmxRange[0] }}</code></td>
          <td class="capability-dmx-range-separator"><code>…</code></td>
          <td class="capability-dmx-range-end"><code>{{ capability.dmxRange[1] }}</code></td>
          <td class="capability-type">{{ capability.type }}</td>
        </tr>
      </tbody>
    </table>

    <span v-if="error" class="error-message">{{ error }}</span>

    <div class="button-bar right">
      <button
        type="button"
        :disabled="error || !wizard.templateCapability.type"
        class="restore primary"
        @click.prevent="apply()">
        Generate capabilities
      </button>
    </div>

  </div>
</template>

<style lang="scss" scoped>
// TODO: a lot of this stuff is duplicated in FixturePageCapabilityTable.vue

.capabilities-table {
  margin-top: 1em;
  table-layout: fixed;
  border-collapse: collapse;
}

th {
  font-weight: 400;
  color: theme-color(text-secondary);
}

td,
th {
  padding: 0 4px;
  vertical-align: top;
}

.capability-dmx-range-start {
  padding-right: 2px;
  text-align: right;
}

.capability-dmx-range-separator {
  padding-right: 0;
  padding-left: 0;
  text-align: center;
}

.capability-dmx-range-end {
  padding-left: 2px;
  text-align: left;
}

.inherited,
.inherited code {
  color: theme-color(text-disabled);
}

.computed,
.computed code {
  color: theme-color(text-primary);
}
</style>

<script setup lang="ts">
import {
  getEmptyCapability,
  isCapabilityChanged,
} from "@/assets/scripts/editor-utilities.js";

import LabeledValue from '../LabeledValue.vue';
import EditorCapabilityTypeData from './EditorCapabilityTypeData.vue';

interface Props {
  channel: object;
  resolution: number;
  wizard: object;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [insertIndex: number];
}>();

const firstInput = ref<HTMLInputElement | null>(null);

const capabilities = computed(() => props.channel.capabilities);

const dmxMax = computed(() => Math.pow(256, props.resolution) - 1);

const insertIndex = computed(() => {
  for (let index = capabilities.value.length - 1; index >= 0; index--) {
    if (capabilities.value[index].dmxRange !== null && capabilities.value[index].dmxRange[1] !== null && capabilities.value[index].dmxRange[1] < props.wizard.start) {
      return index + 1;
    }
  }
  return 0;
});

function replaceHashWithIndex(capabilityTypeData: object, index: number) {
  if (`effectName` in capabilityTypeData) {
    (capabilityTypeData as { effectName: string }).effectName = (capabilityTypeData as { effectName: string }).effectName.replace(/#/, index + 1);
  }
  if (`comment` in capabilityTypeData) {
    (capabilityTypeData as { comment: string }).comment = (capabilityTypeData as { comment: string }).comment.replace(/#/, index + 1);
  }
}

const computedCapabilites = computed(() => {
  const result = [];

  const previousCapability = capabilities.value[insertIndex.value - 1];
  if (
    (!previousCapability && props.wizard.start > 0) ||
    (previousCapability && previousCapability.dmxRange !== null && props.wizard.start > previousCapability.dmxRange[1] + 1)
  ) {
    result.push(getEmptyCapability());
  }

  for (let index = 0; index < props.wizard.count; index++) {
    const capability = getEmptyCapability();

    capability.dmxRange = [
      props.wizard.start + (index * props.wizard.width),
      props.wizard.start + ((index + 1) * props.wizard.width) - 1,
    ];
    capability.type = props.wizard.templateCapability.type;
    capability.typeData = structuredClone(props.wizard.templateCapability.typeData);
    replaceHashWithIndex(capability.typeData, index);

    result.push(capability);
  }

  return result;
});

const removeCount = computed(() => {
  const nextCapability = capabilities.value[insertIndex.value];
  if (nextCapability && isCapabilityChanged(nextCapability)) {
    return 0;
  }

  if (end.value === dmxMax.value) {
    return 1;
  }

  const nextNonEmptyCapability = capabilities.value[insertIndex.value + 1];
  if (nextNonEmptyCapability && nextNonEmptyCapability.dmxRange !== null && end.value + 1 === nextNonEmptyCapability.dmxRange[0]) {
    return 1;
  }

  return 0;
});

const end = computed(() => {
  return computedCapabilites.value.length === 0 ? -1 : computedCapabilites.value.at(-1).dmxRange[1];
});

function getCapabilityWithSource(capability: object, source: string) {
  return { ...capability, source };
}

const allCapabilities = computed(() => {
  const inheritedCapabilities = capabilities.value.map(
    capability => getCapabilityWithSource(capability, `inherited`),
  );

  const computedCaps = computedCapabilites.value.map(
    capability => getCapabilityWithSource(capability, `computed`),
  );

  inheritedCapabilities.splice(insertIndex.value, removeCount.value, ...computedCaps);

  return inheritedCapabilities.filter(
    capability => capability.dmxRange !== null,
  );
});

const validationError = computed(() => {
  if (props.wizard.start < 0) {
    return `Capabilities must not start below DMX value 0.`;
  }

  if (props.wizard.width <= 0) {
    return `Capability width must be greater than zero.`;
  }

  if (props.wizard.start % 1 !== 0 || props.wizard.width % 1 !== 0 || props.wizard.count % 1 !== 0) {
    return `Please do only enter whole number values.`;
  }

  return null;
});

const error = computed(() => {
  if (validationError.value) {
    return validationError.value;
  }

  if (end.value > dmxMax.value) {
    return `Capabilities must not end above DMX value ${dmxMax.value}.`;
  }

  const collisionDetected = capabilities.value.some(capability => {
    if (capability.dmxRange === null) {
      return false;
    }

    const capabilityStart = capability.dmxRange[0] === null ? capability.dmxRange[1] : capability.dmxRange[0];
    const capabilityEnd = capability.dmxRange[1] === null ? capability.dmxRange[0] : capability.dmxRange[1];

    return capabilityEnd >= props.wizard.start && capabilityStart <= end.value;
  });
  if (collisionDetected) {
    return `Generated capabilities must not overlap with existing ones.`;
  }

  return null;
});

onMounted(() => {
  if ((window as any)._oflRestoreComplete) {
    firstInput.value?.focus();
  }

  let lastOccupied = -1;
  for (let index = capabilities.value.length - 1; index >= 0; index--) {
    const capability = capabilities.value[index];

    if (capability.dmxRange === null) {
      continue;
    }

    if (capability.dmxRange[1] !== null) {
      lastOccupied = capability.dmxRange[1];
      break;
    }

    if (capability.dmxRange[0] !== null) {
      lastOccupied = capability.dmxRange[0];
      break;
    }
  }

  props.wizard.start = lastOccupied + 1;
});

function apply() {
  if (error.value) {
    return;
  }

  for (const capability of capabilities.value) {
    if (capability.type !== ``) {
      capability.open = false;
    }
  }

  capabilities.value.splice(insertIndex.value, removeCount.value, ...computedCapabilites.value);

  emit(`close`, insertIndex.value);
}
</script>
