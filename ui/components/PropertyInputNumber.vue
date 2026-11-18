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

interface Properties {
  schemaProperty: {
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    type?: string;
    description?: string;
    $ref?: string;
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

const properties = defineProps<Properties>();

const emit = defineEmits<{
  'update:model-value': [value: number | string | null];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
  'vf:validate': [validationData: Record<string, string | null>];
}>();

const exclusiveMinimum = computed(() => {
  return 'exclusiveMinimum' in properties.schemaProperty ? properties.schemaProperty.exclusiveMinimum : null;
});

const exclusiveMaximum = computed(() => {
  return 'exclusiveMaximum' in properties.schemaProperty ? properties.schemaProperty.exclusiveMaximum : null;
});

const min = computed(() => {
  if (properties.minimum !== undefined && properties.minimum !== 'invalid') {
    return properties.minimum;
  }

  return 'minimum' in properties.schemaProperty ? properties.schemaProperty.minimum : exclusiveMinimum.value;
});

const max = computed(() => {
  if (properties.maximum !== undefined && properties.maximum !== 'invalid') {
    return properties.maximum;
  }

  return 'maximum' in properties.schemaProperty ? properties.schemaProperty.maximum : exclusiveMaximum.value;
});

const step = computed(() => {
  if (properties.stepOverride !== undefined) {
    return properties.stepOverride;
  }
  return properties.schemaProperty.type === 'integer' ? 1 : 'any';
});

const validationData = computed(() => ({
  'min': min.value === null ? null : String(min.value),
  'max': max.value === null ? null : String(max.value),
  'data-exclusive-minimum': exclusiveMinimum.value === null ? null : String(exclusiveMinimum.value),
  'data-exclusive-maximum': exclusiveMaximum.value === null ? null : String(exclusiveMaximum.value),
  'step': String(step.value),
  'type': 'number',
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
  if (properties.modelValue === 'invalid') {
    return [];
  }

  const rules: { name: string; params?: unknown }[] = [];

  if (properties.required) {
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
  () => (properties.name
    ? {
        name: properties.name,
        getValue: () => properties.modelValue,
        getRules: () => fieldRules.value,
        getAttrs: () => validationData.value,
        getElement: () => inputElement.value,
      }
    : null),
  () => properties.modelValue,
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
