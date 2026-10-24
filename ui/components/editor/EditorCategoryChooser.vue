<template>
  <div ref="root">
    <Draggable
      v-model="selectedCategories"
      tag="span"
      :item-key="(category: string) => category">
      <template #item="{ element: cat }">
        <CategoryBadge
          :key="cat"
          :category="cat"
          selected
          selectable
          @click="deselect(cat)"
          @focus="onFocus()"
          @blur="onBlur($event)" />
      </template>
    </Draggable>

    <CategoryBadge
      v-for="cat of unselectedCategories"
      :key="cat"
      :category="cat"
      selectable
      @click="select(cat)"
      @focus="onFocus()"
      @blur="onBlur($event)" />
  </div>
</template>

<script setup lang="ts">
import Draggable from 'vuedraggable';
import { useEditorGroupField } from '~/composables/useEditorForm';

interface Properties {
  modelValue: string[];
  allCategories: string[];
  name?: string;
  categoriesNotEmpty?: boolean;
}

const properties = withDefaults(defineProps<Properties>(), {
  name: '',
  categoriesNotEmpty: false,
});
const emit = defineEmits<{
  'update:model-value': [value: string[]];
  'focus': [];
  'blur': [];
  'vf:validate': [validationData: Record<string, string>];
}>();

const root = ref<HTMLElement | null>(null);

const { touch } = useEditorGroupField(
  () => (properties.name
    ? {
        name: properties.name,
        getValue: () => properties.modelValue,
        getRules: () => (properties.categoriesNotEmpty ? [{ name: 'categories-not-empty' }] : []),
        getAttrs: () => ({}),
        getElement: () => root.value,
      }
    : null),
  () => properties.modelValue,
);

onMounted(() => {
  emit('vf:validate', properties.categoriesNotEmpty ? { 'categories-not-empty': '' } : {});
});

const selectedCategories = computed({
  get() {
    return properties.modelValue;
  },
  set(newSelectedCategories: string[]) {
    emit('update:model-value', newSelectedCategories);
  },
});

const unselectedCategories = computed(() => {
  return properties.allCategories.filter(
    (category) => !properties.modelValue.includes(category),
  );
});

function select(selectedCategory: string) {
  const updatedCategoryList = [...properties.modelValue, selectedCategory];
  emit('update:model-value', updatedCategoryList);
  emit('blur');
}

function deselect(deselectedCategory: string) {
  const updatedCategoryList = properties.modelValue.filter((category) => category !== deselectedCategory);
  emit('update:model-value', updatedCategoryList);
  emit('blur');
}

function onFocus() {
  emit('focus');
}

function onBlur(event: FocusEvent) {
  if (event && event.target && event.relatedTarget
    && (event.target as HTMLElement).parentNode === (event.relatedTarget as HTMLElement)?.parentNode) {
    return;
  }

  touch();
  emit('blur');
}
</script>
