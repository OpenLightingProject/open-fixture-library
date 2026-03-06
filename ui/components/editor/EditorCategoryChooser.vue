<template>
  <div>
    <Draggable v-model="selectedCategories" item-key="." tag="span">
      <template #item="{ element: cat }">
        <CategoryBadge
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

<script>
import { arrayProp } from 'vue-ts-types';
import Draggable from 'vuedraggable';
import CategoryBadge from '../CategoryBadge.vue';

export default {
  components: {
    Draggable,
    CategoryBadge,
  },
  props: {
    modelValue: arrayProp().required,
    allCategories: arrayProp().required,
  },
  emits: {
    'update:modelValue': (value) => true,
    focus: () => true,
    blur: () => true,
  },
  computed: {
    selectedCategories: {
      get() {
        return this.modelValue;
      },
      set(newSelectedCategories) {
        this.$emit('update:modelValue', newSelectedCategories);
      },
    },
    unselectedCategories() {
      return this.allCategories.filter(
        (category) => !this.modelValue.includes(category),
      );
    },
  },
  methods: {
    select(selectedCategory) {
      const updatedCategoryList = [...this.modelValue, selectedCategory];
      this.$emit('update:modelValue', updatedCategoryList);
      this.onBlur();
    },
    deselect(deselectedCategory) {
      const updatedCategoryList = this.modelValue.filter((category) => category !== deselectedCategory);
      this.$emit('update:modelValue', updatedCategoryList);
      this.onBlur();
    },
    onFocus() {
      this.$emit('focus');
    },
    onBlur(event) {
      if (!(event && event.target && event.relatedTarget) || event.target.parentNode !== event.relatedTarget.parentNode) {
        this.$emit('blur');
      }
    },
  },
};
</script>
