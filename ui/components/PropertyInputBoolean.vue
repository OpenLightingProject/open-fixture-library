<template>
  <span>
    <input
      ref="input"
      v-model="localValue"
      type="checkbox"
      :required="required"
      :name="name">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
interface Properties {
  required?: boolean;
  modelValue?: boolean | null;
  name: string;
  label: string;
}

const properties = withDefaults(defineProps<Properties>(), {
  required: false,
  modelValue: false,
});

const emit = defineEmits<{
  'update:model-value': [value: boolean | null];
}>();

const input = ref<HTMLInputElement | null>(null);

const localValue = computed({
  get: () => Boolean(properties.modelValue),
  set: (isChecked: boolean) => {
    emit('update:model-value', isChecked ? true : null);
  },
});

defineExpose({
  focus: () => {
    input.value?.focus();
  },
});
</script>
