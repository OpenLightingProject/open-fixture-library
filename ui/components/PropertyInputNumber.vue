<template>
  <input
    ref="inputElement"
    :name="name"
    :required="required"
    :min="min"
    :max="max"
    :data-exclusive-minimum="exclusiveMinimum"
    :data-exclusive-maximum="exclusiveMaximum"
    :step="step"
    :placeholder="hint"
    :value="modelValue === 'invalid' ? '' : modelValue"
    type="number"
    v-on="lazy ? { change: update } : { input: update }"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)">
</template>

<script setup lang="ts">
import { useEditorGroupField } from '~/composables/useEditorForm';

interface Props {
  schemaProperty: {
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    type?: string;
  };
  required?: boolean;
  hint?: string;
  minimum?: number | string;
  maximum?: number | string;
  modelValue: number | string | null;
  lazy?: boolean;
  stepOverride?: number;
  name?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:model-value': [value: number | string | null];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  'vf:validate': [validationData: Record<string, string | null>];
}>();

const exclusiveMinimum = computed(() => {
  if ('exclusiveMinimum' in props.schemaProperty) {
    return props.schemaProperty.exclusiveMinimum;
  }

  return null;
});

const exclusiveMaximum = computed(() => {
  if ('exclusiveMaximum' in props.schemaProperty) {
    return props.schemaProperty.exclusiveMaximum;
  }

  return null;
});

const min = computed(() => {
  if (props.minimum !== undefined && props.minimum !== 'invalid') {
    return props.minimum;
  }

  if ('minimum' in props.schemaProperty) {
    return props.schemaProperty.minimum;
  }

  return exclusiveMinimum.value;
});

const max = computed(() => {
  if (props.maximum !== undefined && props.maximum !== 'invalid') {
    return props.maximum;
  }

  if ('maximum' in props.schemaProperty) {
    return props.schemaProperty.maximum;
  }

  return exclusiveMaximum.value;
});

const step = computed(() => {
  if (props.stepOverride !== undefined) {
    return props.stepOverride;
  }
  return props.schemaProperty.type === 'integer' ? 1 : 'any';
});

const validationData = computed(() => ({
  min: min.value === null ? null : String(min.value),
  max: max.value === null ? null : String(max.value),
  'data-exclusive-minimum': exclusiveMinimum.value === null ? null : String(exclusiveMinimum.value),
  'data-exclusive-maximum': exclusiveMaximum.value === null ? null : String(exclusiveMaximum.value),
  step: String(step.value),
  type: 'number',
}));

watch(validationData, (newValidationData) => {
  emit('vf:validate', newValidationData);
}, {
  deep: true,
  immediate: true,
});

const inputElement = ref<HTMLInputElement | null>(null);

const fieldRules = computed(() => {
  // The Nuxt 2 oracle drops the `'invalid'` sentinel: its vf:validate data was
  // emitted before the directive listener was attached, so only `required` was
  // ever registered. Match that behaviour instead of adding a new client-side
  // error the old site never showed.
  if (props.modelValue === 'invalid') {
    return [];
  }

  const rules: { name: string; params?: unknown }[] = [];

  if (props.required) {
    rules.push({ name: 'required' });
  }

  rules.push({ name: 'number' });

  for (const ruleName of ['min', 'max', 'step', 'data-exclusive-minimum', 'data-exclusive-maximum']) {
    const value = validationData.value[ruleName];
    if (value !== null && value !== undefined) {
      rules.push({ name: ruleName, params: value });
    }
  }

  return rules;
});

useEditorGroupField(
  () => (props.name
    ? {
        name: props.name,
        getValue: () => props.modelValue,
        getRules: () => fieldRules.value,
        getAttrs: () => validationData.value,
        getElement: () => inputElement.value,
      }
    : null),
  () => props.modelValue,
);

const update = () => {
  const input = document.activeElement as HTMLInputElement;
  if (input.validity && input.validity.badInput) {
    emit('update:model-value', 'invalid');
    return;
  }

  if (input.value === '') {
    emit('update:model-value', null);
    return;
  }

  let value: number | string;
  try {
    value = Number.parseFloat(input.value);
  }
  catch {
    value = 'invalid';
  }

  emit('update:model-value', value);
};

defineExpose({
  focus: () => {
    (document.activeElement as HTMLElement)?.focus();
  },
});
</script>
