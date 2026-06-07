<template>
  <div>
    <Draggable v-model="selectedCategories" tag="span">
      <CategoryBadge
        v-for="cat of modelValue"
        :key="cat"
        :category="cat"
        selected
        selectable
        @click="deselect(cat)"
        @focus="onFocus()"
        @blur="onBlur($event)" />
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
interface Props {
  modelValue: string[];
  allCategories: string[];
}

const props = defineProps<Props>();
import Draggable from 'vuedraggable';
const emit = defineEmits<{
  'update:model-value': [value: string[]];
  focus: [];
  blur: [];
}>();

const selectedCategories = computed({
  get() {
    return props.modelValue;
  },
  set(newSelectedCategories: string[]) {
    emit('update:model-value', newSelectedCategories);
  },
});

const unselectedCategories = computed(() => {
  return props.allCategories.filter(
    category => !props.modelValue.includes(category),
  );
});

function select(selectedCategory: string) {
  const updatedCategoryList = [...props.modelValue, selectedCategory];
  emit('update:model-value', updatedCategoryList);
  emit('blur');
}

function deselect(deselectedCategory: string) {
  const updatedCategoryList = props.modelValue.filter(category => category !== deselectedCategory);
  emit('update:model-value', updatedCategoryList);
  emit('blur');
}

function onFocus() {
  emit('focus');
}

function onBlur(event: FocusEvent) {
  if (!(event && event.target && event.relatedTarget) || (event.target as HTMLElement).parentNode !== (event.relatedTarget as HTMLElement)?.parentNode) {
    emit('blur');
  }
}
</script>
