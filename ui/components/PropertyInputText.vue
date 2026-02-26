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
interface Props {
  schemaProperty: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  required?: boolean;
  hint?: string;
  value: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
});

const emit = defineEmits<{
  input: [value: string];
  blur: [value: string];
  'vf:validate': [validationData: Record<string, string | null>];
}>();

const localValue = ref('');

const validationData = computed(() => ({
  pattern: 'pattern' in props.schemaProperty ? `${props.schemaProperty.pattern}` : null,
  minlength: 'minLength' in props.schemaProperty ? `${props.schemaProperty.minLength}` : null,
  maxlength: 'maxLength' in props.schemaProperty ? `${props.schemaProperty.maxLength}` : null,
}));

watch(() => props.value, (newValue) => {
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
  emit('input', localValue.value);
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
