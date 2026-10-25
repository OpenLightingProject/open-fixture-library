<template>
  <textarea
    v-model.trim="localValue"
    :required="required"
    :placeholder="hint"
    :minlength="schemaProperty.minLength"
    :maxlength="schemaProperty.maxLength"
    @input="update()" />
</template>

<script setup lang="ts">
interface Properties {
  schemaProperty: {
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
  'vf:validate': [validationData: Record<string, string | null>];
}>();

const localValue = ref('');

const validationData = computed(() => ({
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

defineExpose({
  focus: () => {
    (document.activeElement as HTMLElement)?.focus();
  },
});
</script>
