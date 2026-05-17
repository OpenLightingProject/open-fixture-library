<template>
  <div>
    <Draggable v-model="selectedCategories" tag="span">
      <CategoryBadge
        v-for="cat of value"
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
  value: string[];
  allCategories: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  input: [value: string[]];
  focus: [];
  blur: [];
}>();

const selectedCategories = computed({
  get() {
    return props.value;
  },
  set(newSelectedCategories: string[]) {
    emit('input', newSelectedCategories);
  },
});

const unselectedCategories = computed(() => {
  return props.allCategories.filter(
    category => !props.value.includes(category),
  );
});

function select(selectedCategory: string) {
  const updatedCategoryList = [...props.value, selectedCategory];
  emit('input', updatedCategoryList);
  emit('blur');
}

function deselect(deselectedCategory: string) {
  const updatedCategoryList = props.value.filter(category => category !== deselectedCategory);
  emit('input', updatedCategoryList);
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
