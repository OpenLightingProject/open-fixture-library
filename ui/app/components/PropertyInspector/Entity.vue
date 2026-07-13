<template>
  <span class="entity-input" :class="{ 'has-number': hasNumber.value, wide: props.wide }">
    <Validate v-if="hasNumber.value" tag="span">
      <PropertyInputNumber
        ref="input"
        v-model="selectedNumberProxy"
        class="property-input-number"
        :schema-property="units.value[selectedUnit.value].numberSchema"
        required
        :minimum="props.minNumber === undefined ? 'invalid' : props.minNumber"
        :maximum="props.maxNumber === undefined ? 'invalid' : props.maxNumber"
        :name="props.name ? `${props.name}-number` : null"
        @focus="onFocus"
        @blur="onBlur"
      />
    </Validate>

    <select
      ref="select"
      v-model="selectedUnitProxy"
      :required="props.required"
      :class="{ empty: selectedUnit.value === '' }"
      @input="unitSelected"
      @focus="onFocus"
      @blur="onBlur"
    >
      <option :disabled="props.required" value="">unset</option>

      <optgroup v-if="enumValues.value.length > 0" label="Keywords">
        <option
          v-for="enumValue in enumValues.value"
          :key="enumValue"
          :value="enumValue"
        >
          {{ enumValue }}
        </option>
      </optgroup>

      <optgroup v-if="Object.keys(units.value).length > 0" label="Units">
        <option
          v-for="(unit, unitName) in units.value"
          :key="unitName"
          :value="unitName"
        >
          {{ unit.displayString }}
        </option>
      </optgroup>
    </select>
  </span>
</template>

<script setup lang="ts">
import { unitsSchema } from '~~/../lib/schema-properties';

type AnyValue = string | number | null;

const props = withDefaults(
  defineProps<{
    schemaProperty: Record<string, any>;
    required?: boolean;
    associatedEntity?: AnyValue;
    minNumber?: number;
    maxNumber?: number;
    name: string;
    wide?: boolean;
  }>(),
  {
    required: false,
    wide: false,
  }
);

// v-model for the main value
const model = defineModel<AnyValue>('modelValue', { default: '' });

// Emits
const emit = defineEmits<{
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'unit-selected', unitString: string): void;
  (e: 'vf:validate', payload: { 'entity-complete': string; 'entities-have-same-units': string }): void;
}>();

const validationData = {
  'entity-complete': '',
  'entities-have-same-units': '',
};

const subSchemas = computed(() => props.schemaProperty.oneOf || [props.schemaProperty]);

const enumValues = computed<string[]>(() => {
  const enumSubSchema = subSchemas.value.find((s: any) => 'enum' in s);
  return enumSubSchema ? enumSubSchema.enum : [];
});

const unitNames = computed<string[]>(() =>
  subSchemas.value
    .filter((s: any) => '$ref' in s && s.$ref.includes('#/units/'))
    .map((s: any) => s.$ref.replace(/^(?:definitions\.json)?#\/units\//, ''))
);

const units = computed<Record<string, { unitString: string; displayString: string; numberSchema: any }>>(() => {
  const result: Record<string, { unitString: string; displayString: string; numberSchema: any }> = {};
  for (const unitName of unitNames.value) {
    const unitSchema = unitsSchema[unitName];
    const unitString = 'pattern' in unitSchema ? parseUnitFromPattern(unitSchema.pattern as string) : '';
    const numberSchema = 'pattern' in unitSchema ? unitsSchema.number : unitSchema;

    result[unitName] = {
      unitString,
      displayString: getUnitDisplayString(unitString),
      numberSchema,
    };
  }
  return result;
});

// Helpers
function parseUnitFromPattern(pattern: string): string {
  if (!pattern.endsWith('$')) {
    throw new Error(`Pattern does not end with '$': ${pattern}`);
  }
  const lastNumberPartIndex = Math.max(pattern.lastIndexOf(')'), pattern.lastIndexOf('?'));
  return pattern.slice(lastNumberPartIndex + 1, -1).replaceAll('\\', '');
}

function getUnitDisplayString(unitString: string): string {
  if (unitString === '') return 'number';
  return unitString.replace('^2', '²').replace('^3', '³');
}

function getSelectedUnit(value: AnyValue, enums: string[], names: string[], unitMap: Record<string, { unitString: string }>): string {
  if (enums.includes(value as string) || value === '') {
    return value as string;
  }
  if (value === '[no unit]' || typeof value !== 'string') {
    return names.find((n) => unitMap[n].unitString === '') || '';
  }
  const unit = (value as string).replace(/^-?\d+(\.\d+)?/, '');
  return names.find((n) => unitMap[n].unitString === unit) || '';
}

function hasNumberUnit(unitName: string, enums: string[]): boolean {
  return unitName !== '' && !enums.includes(unitName);
}

// Selected unit computed from model
const selectedUnit = computed<string>(() => getSelectedUnit(model.value, enumValues.value, unitNames.value, units.value));

// Direct computed used by the template
const hasNumber = computed<boolean>(() => hasNumberUnit(selectedUnit.value, enumValues.value));

// selectedNumber computed behavior matches original
const selectedNumber = computed<string | number>({
  get() {
    if (typeof model.value !== 'string') {
      return (model.value as number | '' | null) ?? '';
    }
    const number = Number.parseFloat((model.value as string).replace(selectedUnit.value, ''));
    return Number.isNaN(number) ? '' : number;
  },
  set(newNumber) {
    let normalized: string | number = newNumber as any;

    if (normalized === null || normalized === 'invalid') {
      normalized = '';
    }

    const unitInfo = units.value[selectedUnit.value];
    const unitStr = unitInfo?.unitString ?? '';

    if (unitStr === '') {
      if (normalized === '') {
        update('[no unit]');
      } else {
        update(Number.parseFloat(String(normalized)));
      }
    } else {
      update(String(normalized) + unitStr);
    }
  },
});

// Proxies
const selectedUnitProxy = computed<string>({
  get: () => selectedUnit.value,
  set(newUnit: string) {
    if (enumValues.value.includes(newUnit) || newUnit === '') {
      update(newUnit);
    } else if (units.value[newUnit].unitString === '') {
      if (selectedNumber.value === '') {
        update('[no unit]');
      } else {
        update(Number.parseFloat(String(selectedNumber.value)));
      }
      emit('unit-selected', '[no unit]');
    } else {
      update(String(selectedNumber.value) + units.value[newUnit].unitString);
      emit('unit-selected', units.value[newUnit].unitString);
    }
  },
});

const selectedNumberProxy = computed({
  get: () => selectedNumber.value,
  set: (v: any) => {
    selectedNumber.value = v;
  },
});

// Focus/blur handling
const input = ref<{ focus: () => void } | null>(null);
const select = ref<HTMLSelectElement | null>(null);

function focus() {
  const field = input.value ?? select.value;
  field?.focus();
}
defineExpose({ focus });

function onFocus() {
  emit('focus');
}

function onBlur(event: FocusEvent) {
  const target = event.target as HTMLElement | null;
  const related = (event as any).relatedTarget as HTMLElement | null;
  if (!target || !related || target.closest('.entity-input') !== related.closest('.entity-input')) {
    emit('blur');
  }
}

async function unitSelected() {
  await nextTick();
  await nextTick();
  focus();
}

onMounted(() => {
  emit('vf:validate', validationData);
});

function update(newValue: AnyValue) {
  model.value = newValue;
}
</script>

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
