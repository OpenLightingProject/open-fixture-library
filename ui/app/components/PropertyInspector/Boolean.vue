<template>
  <span>
    <input
      ref="input"
      v-model="localValue"
      type="checkbox"
      :required="required"
      :name="name"
    >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    required?: boolean;
    name: string;
    label: string;
  }>(),
  {
    required: false,
  }
);

const model = defineModel<boolean | null>('modelValue', { default: false });

const input = ref<HTMLInputElement | null>(null);

const localValue = computed<boolean>({
  get: () => Boolean(model.value),
  set: (checked: boolean) => {
    model.value = checked ? true : null;
  },
});

function focus() {
  input.value?.focus();
}

defineExpose({ focus });

</script>
