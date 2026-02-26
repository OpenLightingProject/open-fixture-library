<template>
  <select
    v-model="localValue"
    :required="required"
    :class="{ empty: value === '' }">
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
  value: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
});

const emit = defineEmits<{
  input: [value: string];
}>();

const localValue = computed({
  get: () => props.value,
  set: (newValue: string) => {
    emit('input', newValue);
  },
});

defineExpose({
  focus: () => {
    (document.activeElement as HTMLElement)?.focus();
  },
});
</script>
