<template>
  <div class="proportional-capability-data">

    <span
      v-if="hasStartEnd">

      <label
        class="entity-input">

        <PropertyInputNumber
          v-if="entity === `slotNumber`"
          ref="startField"
          v-model="slotNumberStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="slotNumberSchema"
          :step-override="0.5" />

        <PropertyInputEntity
          v-else-if="entitySchema"
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="entitySchema"
          :associated-entity="propertyDataEnd"
          @unit-selected="onUnitSelected($event)" />

        <PropertyInputText
          v-else
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="schemaDefinitions.nonEmptyString"
          :valid-color-hex-list="propertyName === `colorsHexString`"
          hint="start" />

        <span class="hint">
          {{ hint || `value` }} at
          {{ capability.dmxRange && capability.dmxRange[0] !== null ? `DMX value ${capability.dmxRange[0]}` : `capability start` }}
        </span>

      </label>

      <span class="separator">
        <button
          :tabindex="swapButtonTabIndex"
          type="button"
          class="swap icon-button"
          title="Swap start and end values"
          @click.prevent="swapStartEnd()">
          <OflSvg name="swap-horizontal" />
        </button>
        …
      </span>

      <label
        class="entity-input">

        <PropertyInputNumber
          v-if="entity === `slotNumber`"
          ref="endField"
          v-model="slotNumberEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="slotNumberSchema"
          :step-override="0.5" />

        <PropertyInputEntity
          v-else-if="entitySchema"
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="entitySchema"
          :associated-entity="propertyDataStart"
          @unit-selected="onUnitSelected($event)" />

        <PropertyInputText
          v-else
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="schemaDefinitions.nonEmptyString"
          :valid-color-hex-list="propertyName === `colorsHexString`"
          hint="end" />

        <span class="hint">
          {{ hint || `value` }} at
          {{ capability.dmxRange && capability.dmxRange[1] !== null ? `DMX value ${capability.dmxRange[1]}` : `capability end` }}
        </span>

      </label>
    </span>

    <template v-else>
      <PropertyInputNumber
        v-if="entity === `slotNumber`"
        ref="steppedField"
        v-model="slotNumberStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="slotNumberSchema"
        :step-override="0.5" />

      <PropertyInputEntity
        v-else-if="entitySchema"
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="entitySchema" />

      <PropertyInputText
        v-else
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="schemaDefinitions.nonEmptyString"
        :valid-color-hex-list="propertyName === `colorsHexString`" />

      <span v-if="hint" class="hint">{{ hint }}</span>
    </template>

    <section>
      <label>
        <input v-model="hasStartEnd" type="checkbox" @change="focusEndField()">
        Specify range instead of a single value
      </label>
    </section>

  </div>
</template>

<style lang="scss" scoped>
.entity-input {
  display: inline-block;
  vertical-align: top;
}

.separator {
  position: relative;
  margin: 0 1ex;
  vertical-align: -8px;

  .icon-button.swap {
    position: absolute;
    bottom: 0;
    left: 50%;
    margin-left: -1rem;
    background: none;
    border: none;
  }
}

.proportional-capability-data {
  & .icon-button.swap {
    opacity: 0;
    transition-property: opacity, fill;
  }

  &:hover .icon-button.swap,
  & .icon-button.swap:focus {
    opacity: 1;
  }

  &:focus-within .icon-button.swap {
    opacity: 1;
  }
}
</style>

<script setup lang="ts">
import {
  capabilityTypes,
  entitiesSchema,
  schemaDefinitions,
  unitsSchema,
} from '~~/lib/schema-properties.js';

interface Properties {
  capability: {
    uuid: string;
    type?: string;
    typeData: Record<string, any>;
    dmxRange?: [number, number] | null;
  };
  propertyName: string;
  required?: boolean;
  hint?: string;
  // eslint-disable-next-line vue/no-unused-properties -- absorbs the shared `formstate` attribute from editor parents
  formstate?: object;
}

const properties = defineProps<Properties>();

const steppedField = ref<any>(null);
const startField = ref<any>(null);
const endField = ref<any>(null);

const slotNumberUnit = entitiesSchema.slotNumber.$ref.replace('#/units/', '');
const slotNumberSchema = unitsSchema[slotNumberUnit];

const entity = computed(() => {
  const capabilitySchema = capabilityTypes[properties.capability.type];
  if (!capabilitySchema) {
    return '';
  }

  const propertySchema = capabilitySchema.properties[properties.propertyName];
  return propertySchema ? (propertySchema.$ref || '').replace('definitions.json#/entities/', '') : '';
});

const entitySchema = computed(() => {
  return entity.value === '' ? null : entitiesSchema[entity.value];
});

const propertyDataStepped = computed({
  get() {
    return properties.capability.typeData[properties.propertyName];
  },
  set(newData) {
    properties.capability.typeData[properties.propertyName] = newData;
  },
});

const propertyDataStart = computed({
  get() {
    return properties.capability.typeData[`${properties.propertyName}Start`];
  },
  set(newData) {
    properties.capability.typeData[`${properties.propertyName}Start`] = newData;
  },
});

const propertyDataEnd = computed({
  get() {
    return properties.capability.typeData[`${properties.propertyName}End`];
  },
  set(newData) {
    properties.capability.typeData[`${properties.propertyName}End`] = newData;
  },
});

const hasStartEnd = computed({
  get() {
    if (propertyDataStepped.value === null && propertyDataStart.value === null) {
      throw new Error('Stepped and start value are both null. At least one of them should have a value, e.g. an empty string.');
    }

    return propertyDataStepped.value === null;
  },
  set(shouldHaveStartEnd: boolean) {
    if (shouldHaveStartEnd && !hasStartEnd.value) {
      const savedData = propertyDataStepped.value;
      propertyDataStepped.value = null;
      propertyDataStart.value = savedData;
      propertyDataEnd.value = savedData;
    }
    else if (!shouldHaveStartEnd && hasStartEnd.value) {
      const savedData = propertyDataStart.value;
      propertyDataStepped.value = savedData;
      propertyDataStart.value = null;
      propertyDataEnd.value = null;
    }
  },
});

const slotNumberStepped = computed({
  get() {
    return properties.capability.typeData[properties.propertyName];
  },
  set(newData) {
    properties.capability.typeData[properties.propertyName] = newData === null ? '' : newData;
  },
});

const slotNumberStart = computed({
  get() {
    return properties.capability.typeData[`${properties.propertyName}Start`];
  },
  set(newData) {
    properties.capability.typeData[`${properties.propertyName}Start`] = newData === null ? '' : newData;
  },
});

const slotNumberEnd = computed({
  get() {
    return properties.capability.typeData[`${properties.propertyName}End`];
  },
  set(newData) {
    properties.capability.typeData[`${properties.propertyName}End`] = newData === null ? '' : newData;
  },
});

const swapButtonTabIndex = computed(() => {
  return (propertyDataStart.value === propertyDataEnd.value
    || propertyDataStart.value === ''
    || propertyDataEnd.value === '')
    ? '-1'
    : null;
});

/**
 * Focuses the first visible value field.
 */
function focus() {
  for (const field of [steppedField, startField, endField]) {
    if (field.value) {
      field.value.focus();
      return;
    }
  }
}

/**
 * Focuses the start or end field after switching to a range.
 */
async function focusEndField() {
  await nextTick();

  if (!hasStartEnd.value) {
    return;
  }

  const focusField = propertyDataStart.value === '' ? startField.value : endField.value;
  focusField?.focus();
}

/**
 * Applies a selected unit to both range fields.
 * @param newUnit - The selected unit string.
 */
function onUnitSelected(newUnit: string) {
  if (!propertyDataStart.value.endsWith(newUnit)) {
    startField.value?.setUnitString(newUnit);
  }
  if (!propertyDataEnd.value.endsWith(newUnit)) {
    endField.value?.setUnitString(newUnit);
  }
}

/**
 * Swaps the start and end values.
 */
function swapStartEnd() {
  const start = propertyDataStart.value;
  propertyDataStart.value = propertyDataEnd.value;
  propertyDataEnd.value = start;
}

defineExpose({ focus });
</script>
