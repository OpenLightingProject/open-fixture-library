<template>
  <input
    ref="fileInput"
    :required="required"
    :name="name"
    type="file"
    @change="onFileChanged()">
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import { useEditorGroupField } from '~/composables/useEditorForm';

interface Properties {
  required?: boolean;
  name: string;
  modelValue?: File;
}

const properties = defineProps<Properties>();
const emit = defineEmits<{
  'update:model-value': [value: File | undefined];
}>();

const attributes = useAttrs();
const fileInput = ref<HTMLInputElement | null>(null);

useEditorGroupField(
  () => ({
    name: properties.name,
    getValue: () => properties.modelValue,
    getRules: () => {
      const rules = [];
      if (properties.required) {
        rules.push({ name: 'required' });
      }
      if (attributes['max-file-size']) {
        rules.push({ name: 'max-file-size', params: attributes['max-file-size'] });
      }
      return rules;
    },
    getAttrs: () => ({
      'required': properties.required ? '' : undefined,
      'max-file-size': attributes['max-file-size'],
    }),
    getElement: () => fileInput.value,
  }),
  () => properties.modelValue,
);

watch(
  () => properties.modelValue,
  (newFile) => {
    if (!newFile && fileInput.value) {
      fileInput.value.value = '';
    }
  },
);

onMounted(() => {
  onFileChanged();
});

/**
 * Emits the newly selected file.
 */
function onFileChanged() {
  const file = fileInput.value?.files?.[0];

  if (!file) {
    emit('update:model-value', undefined);
    return;
  }

  emit('update:model-value', file);
}
</script>
