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
interface Properties {
  schemaProperty: {
    enum: string[];
  };
  required?: boolean;
  additionHint?: string;
  modelValue: string;
}

const properties = withDefaults(defineProps<Properties>(), {
  additionHint: '',
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [value: string];
}>();

const localValue = computed({
  get: () => properties.modelValue,
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
