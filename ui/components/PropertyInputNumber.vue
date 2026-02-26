<template>
  <input
    :required="required"
    :min="min"
    :max="max"
    :data-exclusive-minimum="exclusiveMinimum"
    :data-exclusive-maximum="exclusiveMaximum"
    :step="step"
    :placeholder="hint"
    :value="value === 'invalid' ? '' : value"
    type="number"
    v-on="lazy ? { change: update } : { input: update }"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)">
</template>

<script setup lang="ts">
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
  value: number | string | null;
  lazy?: boolean;
  stepOverride?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  input: [value: number | string | null];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  'vf:validate': [validationData: Record<string, string | null>];
}>();

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

const step = computed(() => {
  if (props.stepOverride !== undefined) {
    return props.stepOverride;
  }
  return props.schemaProperty.type === 'integer' ? 1 : 'any';
});

const validationData = computed(() => ({
  min: min.value === null ? null : `${min.value}`,
  max: max.value === null ? null : `${max.value}`,
  'data-exclusive-minimum': exclusiveMinimum.value === null ? null : `${exclusiveMinimum.value}`,
  'data-exclusive-maximum': exclusiveMaximum.value === null ? null : `${exclusiveMaximum.value}`,
  step: `${step.value}`,
  type: 'number',
}));

watch(validationData, (newValidationData) => {
  emit('vf:validate', newValidationData);
}, {
  deep: true,
  immediate: true,
});

const update = () => {
  const input = document.activeElement as HTMLInputElement;
  if (input.validity && input.validity.badInput) {
    emit('input', 'invalid');
    return;
  }

  if (input.value === '') {
    emit('input', null);
    return;
  }

  let value: number | string;
  try {
    value = Number.parseFloat(input.value);
  }
  catch {
    value = 'invalid';
  }

  emit('input', value);
};

defineExpose({
  focus: () => {
    (document.activeElement as HTMLElement)?.focus();
  },
});
</script>
