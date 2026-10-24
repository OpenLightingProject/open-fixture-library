<template>
  <input
    ref="fileInput"
    :required="required"
    :name="name"
    type="file"
    @change="onFileChanged()">
</template>

<script setup lang="ts">
interface Props {
  required?: boolean;
  name: string;
  modelValue?: File | undefined;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:model-value': [value: File | undefined];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  (newFile) => {
    if (!newFile && fileInput.value) {
      fileInput.value.value = '';
    }
  }
);

onMounted(() => {
  onFileChanged();
});

function onFileChanged() {
  const file = fileInput.value?.files?.[0];

  if (!file) {
    emit('update:model-value', undefined);
    return;
  }

  emit('update:model-value', file);
}
</script>
