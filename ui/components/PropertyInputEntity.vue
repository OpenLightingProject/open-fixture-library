<template>
  <span class="entity-input" :class="{ 'has-number': hasNumber, wide }">

    <Validate v-if="hasNumber" tag="span">
      <PropertyInputNumber
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
    </Validate>

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
import { unitsSchema } from '~~/lib/schema-properties.js';

interface Props {
  schemaProperty: {
    oneOf?: object[];
  };
  required?: boolean;
  value: string | number | null;
  associatedEntity?: unknown;
  minNumber?: number;
  maxNumber?: number;
  name: string;
  wide?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  value: '',
  wide: false,
});

const emit = defineEmits<{
  input: [value: string | number | null];
  focus: [];
  blur: [];
  'unit-selected': [unitString: string];
  'vf:validate': [validationData: { 'entity-complete': string; 'entities-have-same-units': string }];
}>();

const input = ref<InstanceType<typeof PropertyInputNumber> | null>(null);
const select = ref<HTMLSelectElement | null>(null);

const validationData = ref({
  'entity-complete': '',
  'entities-have-same-units': '',
});

const subSchemas = computed(() => props.schemaProperty.oneOf || [props.schemaProperty]);

const enumValues = computed(() => {
  const enumSubSchema = subSchemas.value.find(subSchema => 'enum' in subSchema);

  return enumSubSchema ? (enumSubSchema as { enum: string[] }).enum : [];
});

const unitNames = computed(() => {
  return subSchemas.value.filter(
    subSchema => '$ref' in subSchema && (subSchema as { $ref: string }).$ref.includes('#/units/'),
  ).map(
    subSchema => (subSchema as { $ref: string }).$ref.replace(/^(?:definitions\.json)?#\/units\//, ''),
  );
});

const units = computed(() => {
  const units: Record<string, { unitString: string; displayString: string; numberSchema: object }> = {};
  for (const unitName of unitNames.value) {
    const unitSchema = unitsSchema[unitName];

    const unitString = 'pattern' in unitSchema ? parseUnitFromPattern(unitSchema.pattern) : '';
    const numberSchema = 'pattern' in unitSchema ? unitsSchema.number : unitSchema;

    units[unitName] = {
      unitString,
      displayString: getUnitDisplayString(unitString),
      numberSchema,
    };
  }

  return units;
});

const selectedUnit = computed({
  get: () => getSelectedUnit(props.value, enumValues.value, unitNames.value, units.value),
  set: (newUnit: string) => {
    if (enumValues.value.includes(newUnit) || newUnit === '') {
      update(newUnit);
    }
    else if (units.value[newUnit]?.unitString === '') {
      if (selectedNumber.value === '') {
        update('[no unit]');
      }
      else {
        update(Number.parseFloat(selectedNumber.value as string));
      }
      emit('unit-selected', '[no unit]');
    }
    else {
      update((selectedNumber.value as number) + units.value[newUnit].unitString);
      emit('unit-selected', units.value[newUnit].unitString);
    }
  },
});

const hasNumber = computed(() => hasNumberFunc(selectedUnit.value, enumValues.value));

const selectedNumber = computed({
  get: () => {
    if (typeof props.value !== 'string') {
      return props.value;
    }

    const number = Number.parseFloat(props.value.replace(selectedUnit.value, ''));

    return Number.isNaN(number) ? '' : number;
  },
  set: (newNumber: number | string) => {
    if (newNumber === null || newNumber === 'invalid') {
      newNumber = '';
    }

    if (units.value[selectedUnit.value]?.unitString === '') {
      if (newNumber === '') {
        update('[no unit]');
      }
      else {
        update(Number.parseFloat(newNumber as string));
      }
    }
    else {
      update(newNumber + units.value[selectedUnit.value].unitString);
    }
  },
});

const hasSameUnit = computed(() => {
  if (!props.associatedEntity) {
    return true;
  }

  const otherFieldSelectedUnit = getSelectedUnit(props.associatedEntity, enumValues.value, unitNames.value, units.value);

  if (!hasNumber.value && !hasNumberFunc(otherFieldSelectedUnit, enumValues.value)) {
    return true;
  }

  return selectedUnit.value === otherFieldSelectedUnit;
});

onMounted(() => {
  emit('vf:validate', validationData.value);
});

const focus = () => {
  const focusField = input.value ?? select.value;
  focusField?.focus();
};

const update = (newValue: string | number | null) => {
  emit('input', newValue);
};

const setUnitString = (newUnitString: string) => {
  if (newUnitString === '[no unit]') {
    newUnitString = '';
  }

  selectedUnit.value = Object.keys(units.value).find(
    unitName => units.value[unitName].unitString === newUnitString,
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
  if (!(event.target && event.relatedTarget) || (event.target as Element).closest('.entity-input') !== (event.relatedTarget as Element)?.closest('.entity-input')) {
    emit('blur');
  }
};

defineExpose({
  focus,
  hasSameUnit,
  setUnitString,
});

function parseUnitFromPattern(pattern: string): string {
  if (!pattern.endsWith('$')) {
    throw new Error(`Pattern does not end with '$': ${pattern}`);
  }

  const lastNumberPartIndex = Math.max(pattern.lastIndexOf(')'), pattern.lastIndexOf('?'));
  return pattern.slice(lastNumberPartIndex + 1, -1).replaceAll('\\', '');
}

function getUnitDisplayString(unitString: string): string {
  if (unitString === '') {
    return 'number';
  }

  return unitString.replace('^2', '²').replace('^3', '³');
}

function getSelectedUnit(value: string | number | null, enumValues: string[], unitNames: string[], units: Record<string, { unitString: string }>): string {
  if (enumValues.includes(value as string) || value === '') {
    return value as string;
  }

  if (value === '[no unit]' || typeof value !== 'string') {
    return unitNames.find(name => units[name].unitString === '') || '';
  }

  const unit = value.replace(/^-?\d+(\.\d+)?/, '');

  return unitNames.find(name => units[name].unitString === unit) || '';
}

function hasNumberFunc(unitName: string, enumValues: string[]): boolean {
  return unitName !== '' && !enumValues.includes(unitName);
}
</script>
