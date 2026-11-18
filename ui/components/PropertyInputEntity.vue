<template>
  <span ref="root" class="entity-input" :class="{ 'has-number': hasNumber, wide }">

    <PropertyInputNumber
      v-if="hasNumber"
      ref="input"
      v-model="selectedNumber"
      class="property-input-number"
      :schema-property="units[selectedUnit]?.numberSchema"
      required
      :minimum="minNumber === undefined ? 'invalid' : minNumber"
      :maximum="maxNumber === undefined ? 'invalid' : maxNumber"
      :name="name ? `${name}-number` : null"
      @focus="onFocus()"
      @blur="onBlur($event)" />

    <select
      ref="select"
      v-model="selectedUnit"
      :required="required"
      :class="{ empty: selectedUnit === '' }"
      @input="unitSelected()"
      @focus="onFocus()"
      @blur="onBlur($event)">

      <option :disabled="required" value="">unset</option>

      <optgroup v-if="enumValues.length > 0" label="Keywords">
        <option
          v-for="enumValue of enumValues"
          :key="enumValue"
          :value="enumValue">{{ enumValue }}</option>
      </optgroup>

      <optgroup v-if="Object.keys(units).length > 0" label="Units">
        <option
          v-for="({ displayString }, unitName) of units"
          :key="unitName"
          :value="unitName">{{ displayString }}</option>
      </optgroup>

    </select>
  </span>
</template>

<style lang="scss" scoped>
.entity-input {
  & select {
    width: 20ex;
  }

  &.wide select {
    width: 30ex;
  }

  &.has-number {
    & select {
      width: 10ex;
    }

    & .property-input-number {
      width: 9ex;
      margin-right: 1ex;
    }
  }

  &.wide.has-number {
    & select {
      width: 15ex;
    }

    & .property-input-number {
      width: 14ex;
      margin-right: 1ex;
    }
  }
}
</style>

<script setup lang="ts">
import { useEditorGroupField } from '~/composables/useEditorForm';
import { unitsSchema } from '~~/lib/schema-properties.js';
import PropertyInputNumber from './PropertyInputNumber.vue';

type EntityValue = string | number | null;

interface Properties {
  schemaProperty: {
    oneOf?: object[];
  };
  required?: boolean;
  modelValue?: EntityValue;
  associatedEntity?: unknown;
  minNumber?: number;
  maxNumber?: number;
  name: string;
  wide?: boolean;
}

const properties = withDefaults(defineProps<Properties>(), {
  required: false,
  modelValue: '',
  associatedEntity: undefined,
  minNumber: undefined,
  maxNumber: undefined,
  wide: false,
});

const emit = defineEmits<{
  'update:model-value': [value: EntityValue];
  'focus': [];
  'blur': [];
  'unit-selected': [unitString: string];
  'vf:validate': [validationData: { 'entity-complete': string; 'entities-have-same-units': string }];
}>();

const input = ref<InstanceType<typeof PropertyInputNumber> | null>(null);
const select = ref<HTMLSelectElement | null>(null);
const root = ref<HTMLElement | null>(null);

const validationData = ref({
  'entity-complete': '',
  'entities-have-same-units': '',
});

const subSchemas = computed(() => properties.schemaProperty.oneOf || [properties.schemaProperty]);

const enumValues = computed(() => {
  const enumSubSchema = subSchemas.value.find((subSchema) => 'enum' in subSchema);

  return enumSubSchema ? (enumSubSchema as { enum: string[] }).enum : [];
});

const unitNames = computed(() => {
  return subSchemas.value.filter(
    (subSchema) => '$ref' in subSchema && (subSchema as { $ref: string }).$ref.includes('#/units/'),
  ).map(
    (subSchema) => (subSchema as { $ref: string }).$ref.replace(/^(?:definitions\.json)?#\/units\//, ''),
  );
});

const units = computed(() => {
  const unitDefinitions: Record<string, { unitString: string; displayString: string; numberSchema: object }> = {};
  for (const unitName of unitNames.value) {
    const unitSchema = unitsSchema[unitName];

    const unitString = 'pattern' in unitSchema ? parseUnitFromPattern(unitSchema.pattern) : '';
    const numberSchema = 'pattern' in unitSchema ? unitsSchema.number : unitSchema;

    unitDefinitions[unitName] = {
      unitString,
      displayString: getUnitDisplayString(unitString),
      numberSchema,
    };
  }

  return unitDefinitions;
});

const selectedUnit = computed({
  get: () => getSelectedUnit(properties.modelValue, enumValues.value, unitNames.value, units.value),
  set: (newUnit: string) => {
    if (newUnit === '' || enumValues.value.includes(newUnit)) {
      update(newUnit);
    }
    else if (units.value[newUnit]?.unitString === '') {
      update(selectedNumber.value === '' ? '[no unit]' : Number.parseFloat(String(selectedNumber.value)));
      emit('unit-selected', '[no unit]');
    }
    else {
      update((selectedNumber.value as number) + units.value[newUnit].unitString);
      emit('unit-selected', units.value[newUnit].unitString);
    }
  },
});

const hasNumber = computed(() => hasNumberFunction(selectedUnit.value, enumValues.value));

const selectedNumber = computed({
  get: () => {
    if (typeof properties.modelValue !== 'string') {
      return properties.modelValue;
    }

    const number = Number.parseFloat(properties.modelValue.replace(selectedUnit.value, ''));

    return Number.isNaN(number) ? '' : number;
  },
  set: (newNumber: number | string) => {
    if (newNumber === null || newNumber === 'invalid') {
      newNumber = '';
    }

    if (units.value[selectedUnit.value]?.unitString === '') {
      update(newNumber === '' ? '[no unit]' : Number.parseFloat(newNumber as string));
    }
    else {
      update(newNumber + units.value[selectedUnit.value].unitString);
    }
  },
});

const hasSameUnit = computed(() => {
  if (!properties.associatedEntity) {
    return true;
  }

  const otherFieldSelectedUnit = getSelectedUnit(properties.associatedEntity as EntityValue, enumValues.value, unitNames.value, units.value);

  return !(hasNumber.value || hasNumberFunction(otherFieldSelectedUnit, enumValues.value)) || selectedUnit.value === otherFieldSelectedUnit;
});

onMounted(() => {
  emit('vf:validate', validationData.value);
});

const { touch } = useEditorGroupField(
  () => ({
    name: properties.name,
    getValue: () => properties.modelValue,
    getRules: () => [
      { name: 'entity-complete', allowEmpty: true },
      { name: 'entities-have-same-units', allowEmpty: true },
    ],
    getAttrs: () => ({}),
    getElement: () => root.value,
    getEntityData: () => ({
      hasNumber: hasNumber.value,
      selectedNumber: selectedNumber.value,
      hasSameUnit: hasSameUnit.value,
    }),
  }),
  () => [properties.modelValue, properties.associatedEntity, selectedUnit.value],
);

const focus = () => {
  const focusField = input.value ?? select.value;
  focusField?.focus();
};

const update = (newValue: EntityValue) => {
  emit('update:model-value', newValue);
};

const setUnitString = (newUnitString: string) => {
  if (newUnitString === '[no unit]') {
    newUnitString = '';
  }

  selectedUnit.value = Object.keys(units.value).find(
    (unitName) => units.value[unitName].unitString === newUnitString,
  ) || '';
};

const unitSelected = async () => {
  await nextTick();
  await nextTick();
  focus();
};

const onFocus = () => {
  emit('focus');
};

const onBlur = (event: FocusEvent) => {
  if (event.target && event.relatedTarget
    && (event.target as Element).closest('.entity-input') === (event.relatedTarget as Element).closest('.entity-input')) {
    return;
  }

  touch();
  emit('blur');
};

defineExpose({
  focus,
  hasNumber,
  selectedNumber,
  hasSameUnit,
  setUnitString,
});

/**
 * Extracts the unit suffix from a schema pattern.
 * @param pattern - The JSON schema pattern.
 * @returns The unit string.
 */
function parseUnitFromPattern(pattern: string): string {
  if (!pattern.endsWith('$')) {
    throw new Error(`Pattern does not end with '$': ${pattern}`);
  }

  const lastNumberPartIndex = Math.max(pattern.lastIndexOf(')'), pattern.lastIndexOf('?'));
  return pattern.slice(lastNumberPartIndex + 1, -1).replaceAll('\\', '');
}

/**
 * Formats a unit string for display.
 * @param unitString - The raw unit string.
 * @returns The display string.
 */
function getUnitDisplayString(unitString: string): string {
  return unitString === '' ? 'number' : unitString.replace('^2', '²').replace('^3', '³');
}

/**
 * Determines which unit applies to the current value.
 * @param value - The current entity value.
 * @param enumValuesList - The allowed enum values.
 * @param unitNamesList - The unit names allowed by the schema.
 * @param unitDefinitions - Unit metadata keyed by unit name.
 * @returns The selected unit name.
 */
function getSelectedUnit(value: EntityValue, enumValuesList: string[], unitNamesList: string[], unitDefinitions: Record<string, { unitString: string }>): string {
  if (value === '' || enumValuesList.includes(value as string)) {
    return value as string;
  }

  if (value === '[no unit]' || typeof value !== 'string') {
    return unitNamesList.find((name) => unitDefinitions[name].unitString === '') || '';
  }

  const unit = value.replace(/^-?\d+(\.\d+)?/, '');

  return unitNamesList.find((name) => unitDefinitions[name].unitString === unit) || '';
}

/**
 * Checks whether a unit name represents a numeric value.
 * @param unitName - The unit name.
 * @param enumValuesList - The allowed enum values.
 * @returns Whether the value is numeric.
 */
function hasNumberFunction(unitName: string, enumValuesList: string[]): boolean {
  return unitName !== '' && !enumValuesList.includes(unitName);
}
</script>
