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

interface Props {
  required?: boolean;
  name: string;
  modelValue?: File | undefined;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:model-value': [value: File | undefined];
}>();

const attrs = useAttrs();
const fileInput = ref<HTMLInputElement | null>(null);

useEditorGroupField(
  () => ({
    name: props.name,
    getValue: () => props.modelValue,
    getRules: () => {
      const rules = [];
      if (props.required) {
        rules.push({ name: 'required' });
      }
      if (attrs['max-file-size']) {
        rules.push({ name: 'max-file-size', params: attrs['max-file-size'] });
      }
      return rules;
    },
    getAttrs: () => ({
      required: props.required ? '' : undefined,
      'max-file-size': attrs['max-file-size'],
    }),
    getElement: () => fileInput.value,
  }),
  () => props.modelValue,
);

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
