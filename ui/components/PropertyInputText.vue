<template>
  <input
    v-model.trim="localValue"
    :required="required"
    :placeholder="hint"
    :pattern="schemaProperty.pattern"
    :minlength="schemaProperty.minLength"
    :maxlength="schemaProperty.maxLength"
    type="text"
    @input="update()"
    @blur="onBlur()">
</template>

<script setup lang="ts">
interface Properties {
  schemaProperty: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    description?: string;
    $ref?: string;
  };
  required?: boolean;
  hint?: string;
  modelValue: string | null;
}

const properties = withDefaults(defineProps<Properties>(), {
  hint: '',
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [value: string];
  'blur': [value: string];
  'vf:validate': [validationData: Record<string, string | null>];
}>();

const localValue = ref('');

const validationData = computed(() => ({
  pattern: 'pattern' in properties.schemaProperty ? properties.schemaProperty.pattern : null,
  minlength: 'minLength' in properties.schemaProperty ? String(properties.schemaProperty.minLength) : null,
  maxlength: 'maxLength' in properties.schemaProperty ? String(properties.schemaProperty.maxLength) : null,
}));

watch(() => properties.modelValue, (newValue) => {
  localValue.value = newValue ? String(newValue) : '';
}, {
  immediate: true,
});

watch(validationData, (newValidationData) => {
  emit('vf:validate', newValidationData);
}, {
  deep: true,
  immediate: true,
});

const update = () => {
  emit('update:model-value', localValue.value);
};

const onBlur = async () => {
  await nextTick();
  emit('blur', localValue.value);
};

defineExpose({
  focus: () => {
    (document.activeElement as HTMLElement)?.focus();
  },
});
</script>
