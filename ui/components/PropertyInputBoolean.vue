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
interface Props {
  required?: boolean;
  modelValue: boolean;
  name: string;
  label: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  modelValue: false,
});

const emit = defineEmits<{
  'update:model-value': [value: boolean | null];
}>();

const input = ref<HTMLInputElement | null>(null);

const localValue = computed({
  get: () => props.modelValue,
  set: (newValue: boolean) => {
    emit('update:model-value', newValue ? true : null);
  },
});

defineExpose({
  focus: () => {
    input.value?.focus();
  },
});
</script>
