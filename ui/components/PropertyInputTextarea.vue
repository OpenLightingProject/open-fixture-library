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
interface Props {
  schemaProperty: {
    minLength?: number;
    maxLength?: number;
  };
  required?: boolean;
  hint?: string;
  modelValue: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [value: string];
  'vf:validate': [validationData: Record<string, string | null>];
}>();

const localValue = ref('');

const validationData = computed(() => ({
  minlength: 'minLength' in props.schemaProperty ? String(props.schemaProperty.minLength) : null,
  maxlength: 'maxLength' in props.schemaProperty ? String(props.schemaProperty.maxLength) : null,
}));

watch(() => props.modelValue, (newValue) => {
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
