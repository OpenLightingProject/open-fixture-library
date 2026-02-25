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
    value: arrayProp().required,
    allCategories: arrayProp().required,
  },
  emits: {
    input: value => true,
    focus: () => true,
    blur: () => true,
  },
  computed: {
    selectedCategories: {
      get() {
        return this.value;
      },
      set(newSelectedCategories) {
        this.$emit(`input`, newSelectedCategories);
      },
    },
    unselectedCategories() {
      return this.allCategories.filter(
        category => !this.value.includes(category),
      );
    },
  },
  methods: {
    select(selectedCategory) {
      const updatedCategoryList = [...this.value, selectedCategory];
      this.$emit(`input`, updatedCategoryList);
      this.onBlur();
    },
    deselect(deselectedCategory) {
      const updatedCategoryList = this.value.filter(category => category !== deselectedCategory);
      this.$emit(`input`, updatedCategoryList);
      this.onBlur();
    },
    onFocus() {
      this.$emit(`focus`);
    },
    onBlur(event) {
      if (!(event && event.target && event.relatedTarget) || event.target.parentNode !== event.relatedTarget.parentNode) {
        this.$emit(`blur`);
      }
    },
  },
};
</script>
