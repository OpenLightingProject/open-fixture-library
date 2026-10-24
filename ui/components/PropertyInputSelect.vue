<template>
  <select
    v-model="localValue"
    :required="required"
    :class="{ empty: modelValue === '' }">
    <option :disabled="required" value="">unknown</option>
    <option
      v-for="item of schemaProperty.enum"
      :key="item"
      :value="item">{{ item }}</option>
    <option
      v-if="additionHint"
      value="[add-value]">{{ additionHint }}</option>
  </select>
</template>

<script setup lang="ts">
interface Props {
  schemaProperty: {
    enum: string[];
  };
  required?: boolean;
  additionHint?: string;
  modelValue: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [value: string];
}>();

const localValue = computed({
  get: () => props.modelValue,
  set: (newValue: string) => {
    emit('update:model-value', newValue);
  },
});

defineExpose({
  focus: () => {
    (document.activeElement as HTMLElement)?.focus();
  },
});
</script>
