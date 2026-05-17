<template>
  <div class="editor-capability-type-data">
    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-type`"
      :hint="capabilityTypeHint"
      label="Capability type">
      <select
        v-model="capability.type"
        :class="{ empty: capability.type === `` }"
        :name="`capability${capability.uuid}-type`"
        :required="required">

        <option value="" disabled>Please select a capability type</option>

        <option
          v-for="type of capabilityTypes"
          :key="type"
          :value="type">{{ type }}</option>

      </select>
    </LabeledInput>

    <Component
      :is="`Capability${capability.type}`"
      v-if="capability.type !== ``"
      ref="capabilityTypeData"
      :capability="capability"
      :channel="channel"
      :formstate="formstate" />
  </div>
</template>

<script setup lang="ts">
import { capabilityTypes } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    type: string;
    typeData: Record<string, any>;
  };
  channel: object;
  formstate?: object;
  required?: boolean;
}

const props = defineProps<Props>();

const capabilityTypeData = ref<any>(null);

const capabilityTypesList = Object.keys(capabilityTypes);
const capabilityTypeHint = ref<string | null>(null);

watch(
  () => props.capability.type,
  async () => {
    await nextTick();

    if (capabilityTypeData.value?.defaultData) {
      const defaultData = capabilityTypeData.value.defaultData;
      for (const property of Object.keys(defaultData)) {
        if (!(property in props.capability.typeData)) {
          props.capability.typeData[property] = defaultData[property];
        }
      }
    }

    capabilityTypeHint.value = capabilityTypeData.value?.hint ?? null;
  }
);

function cleanCapabilityData() {
  const component = capabilityTypeData.value;

  if (!component) return;

  const defaultData = component.defaultData;

  for (const property of Object.keys(props.capability.typeData)) {
    if (!(property in defaultData)) {
      delete props.capability.typeData[property];
    }
  }

  if (component?.resetProperties) {
    const resetProperties = component.resetProperties;

    for (const property of resetProperties) {
      const defaultPropertyData = defaultData[property];
      props.capability.typeData[property] = typeof defaultPropertyData === 'string' ? '' : defaultPropertyData;
    }
  }

  props.capability.open = false;
}

defineExpose({ cleanCapabilityData });
</script>
