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
  value: boolean;
  name: string;
  label: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  value: false,
});

const emit = defineEmits<{
  input: [value: boolean | null];
}>();

const input = ref<HTMLInputElement | null>(null);

const localValue = computed({
  get: () => props.value,
  set: (newValue: boolean) => {
    emit('input', newValue ? true : null);
  },
});

defineExpose({
  focus: () => {
    input.value?.focus();
  },
});
</script>
