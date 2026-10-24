<template>
  <span ref="root" class="range">
    <PropertyInputNumber
      ref="firstInput"
      v-model="start"
      :name="`${name}-start`"
      :schema-property="schemaProperty.items"
      :minimum="rangeMin"
      :maximum="end === 'invalid' ? rangeMax : end"
      :required="required || rangeIncomplete"
      :hint="startHint"
      lazy
      @focus="onFocus($event)"
      @blur="onBlur($event)" />
    …
    <PropertyInputNumber
      v-model="end"
      :name="`${name}-end`"
      :schema-property="schemaProperty.items"
      :minimum="start === 'invalid' ? rangeMin : start"
      :maximum="rangeMax"
      :required="required || rangeIncomplete"
      :hint="endHint"
      lazy
      @focus="onFocus($event)"
      @blur="onBlur($event)" />
    {{ unit }}
  </span>
</template>

<script setup lang="ts">
import { useEditorGroupField } from '~/composables/useEditorForm';

interface Props {
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
  formstate: object;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  startHint: 'start',
  endHint: 'end',
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [range: number[] | null];
  'start-updated': [];
  'end-updated': [];
  focus: [];
  blur: [];
  'vf:validate': [validationData: { 'complete-range': string; 'valid-range': string }];
}>();

const firstInput = ref<InstanceType<typeof PropertyInputNumber> | null>(null);
const root = ref<HTMLElement | null>(null);

const { touch } = useEditorGroupField(
  () => ({
    name: props.name,
    getValue: () => props.modelValue,
    getRules: () => [
      { name: 'complete-range' },
      { name: 'valid-range' },
    ],
    getAttrs: () => ({}),
    getElement: () => root.value,
  }),
  () => props.modelValue,
);

const validationData = ref({
  'complete-range': '',
  'valid-range': '',
});

const start = computed({
  get: () => props.modelValue ? props.modelValue[0] : null,
  set: (startInput: number | null) => {
    emit('update:model-value', getRange(startInput, end.value));
    emit('start-updated');
  },
});

const end = computed({
  get: () => props.modelValue ? props.modelValue[1] : null,
  set: (endInput: number | null) => {
    emit('update:model-value', getRange(start.value, endInput));
    emit('end-updated');
  },
});

const rangeIncomplete = computed(() => props.modelValue && (start.value === null || end.value === null));

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

function getRange(start: number | null, end: number | null): number[] | null {
  if (start === null && end === null) {
    return null;
  }

  return [start, end];
}
</script>
