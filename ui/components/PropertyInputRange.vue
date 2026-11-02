<template>
  <span ref="root" class="range">
    <PropertyInputNumber
      ref="firstInput"
      v-model="start"
      :name="`${name}-start`"
      :schema-property="schemaProperty.items"
      :minimum="rangeMin"
      :maximum="isInvalidValue(end) ? rangeMax : end"
      :required="required || rangeIncomplete"
      :hint="startHint"
      lazy
      @focus="onFocus()"
      @blur="onBlur($event)" />
    …
    <PropertyInputNumber
      v-model="end"
      :name="`${name}-end`"
      :schema-property="schemaProperty.items"
      :minimum="isInvalidValue(start) ? rangeMin : start"
      :maximum="rangeMax"
      :required="required || rangeIncomplete"
      :hint="endHint"
      lazy
      @focus="onFocus()"
      @blur="onBlur($event)" />
    {{ unit }}
  </span>
</template>

<script setup lang="ts">
import { useEditorGroupField } from '~/composables/useEditorForm';
import PropertyInputNumber from './PropertyInputNumber.vue';

interface Properties {
  modelValue?: number[] | null;
  name: string;
  startHint?: string;
  endHint?: string;
  rangeMin?: number;
  rangeMax?: number;
  schemaProperty: {
    items: object;
  };
  unit?: string;
  required?: boolean;
  // eslint-disable-next-line vue/no-unused-properties -- absorbs the shared `formstate` attribute from editor parents
  formstate: object;
}

const properties = withDefaults(defineProps<Properties>(), {
  modelValue: null,
  startHint: 'start',
  endHint: 'end',
  rangeMin: undefined,
  rangeMax: undefined,
  unit: '',
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [range: number[] | null];
  'start-updated': [];
  'end-updated': [];
  'focus': [];
  'blur': [];
  'vf:validate': [validationData: { 'complete-range': string; 'valid-range': string }];
}>();

const firstInput = ref<InstanceType<typeof PropertyInputNumber> | null>(null);
const root = ref<HTMLElement | null>(null);

const { touch } = useEditorGroupField(
  () => ({
    name: properties.name,
    getValue: () => properties.modelValue,
    getRules: () => [
      { name: 'complete-range' },
      { name: 'valid-range' },
    ],
    getAttrs: () => ({}),
    getElement: () => root.value,
  }),
  () => properties.modelValue,
);

const validationData = ref({
  'complete-range': '',
  'valid-range': '',
});

const start = computed({
  get: () => (properties.modelValue ? properties.modelValue[0] : null),
  set: (startInput: number | null) => {
    emit('update:model-value', getRange(startInput, end.value));
    emit('start-updated');
  },
});

const end = computed({
  get: () => (properties.modelValue ? properties.modelValue[1] : null),
  set: (endInput: number | null) => {
    emit('update:model-value', getRange(start.value, endInput));
    emit('end-updated');
  },
});

const rangeIncomplete = computed(() => properties.modelValue && (start.value === null || end.value === null));

/**
 * Detects the sentinel emitted by the numeric input for unparsable values.
 * @param value - The value to inspect.
 * @returns Whether the value is the invalid-value sentinel.
 */
function isInvalidValue(value: unknown): boolean {
  return value === 'invalid';
}

onMounted(() => {
  emit('vf:validate', validationData.value);
});

const onFocus = () => {
  emit('focus');
};

const onBlur = (event: FocusEvent) => {
  if (event.target && event.relatedTarget
    && (event.target as Element).closest('.range') === (event.relatedTarget as Element).closest('.range')) {
    return;
  }

  touch();
  emit('blur');
};

defineExpose({
  focus: () => {
    firstInput.value?.focus();
  },
});

/**
 * Builds the range tuple, or `null` when both bounds are empty.
 * @param startValue - The lower bound.
 * @param endValue - The upper bound.
 * @returns The range tuple or `null`.
 */
function getRange(startValue: number | null, endValue: number | null): number[] | null {
  return startValue === null && endValue === null ? null : [startValue, endValue];
}
</script>
