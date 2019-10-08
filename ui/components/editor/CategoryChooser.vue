<template>
  <div>
    <Draggable v-model="selectedCategories" tag="span">
      <CategoryBadge
        v-for="cat in value"
        :key="cat"
        :category="cat"
        :selected="true"
        :selectable="true"
        @click="deselect(cat)"
        @focus.native="onFocus"
        @blur.native="onBlur($event)" />
    </Draggable>

    <CategoryBadge
      v-for="cat in unselectedCategories"
      :key="cat"
      :category="cat"
      :selected="false"
      :selectable="true"
      @click="select(cat)"
      @focus.native="onFocus"
      @blur.native="onBlur($event)" />
  </div>
</template>


<script>
import Draggable from 'vuedraggable';
import CategoryBadge from '../CategoryBadge.vue';

export default {
  components: {
    Draggable,
    CategoryBadge
  },
  props: {
    value: {
      type: Array,
      required: true
    },
    allCategories: {
      type: Array,
      required: true
    }
  },
  computed: {
    selectedCategories: {
      get() {
        return this.value;
      },
      set(newSelectedCategories) {
        this.$emit(`input`, newSelectedCategories);
      }
    },
    unselectedCategories() {
      return this.allCategories.filter(
        cat => !this.value.includes(cat)
      );
    }
  },
  methods: {
    select(selectedCat) {
      const updatedCategoryList = [...this.value, selectedCat];
      this.$emit(`input`, updatedCategoryList);
      this.onBlur();
    },
    deselect(deselectedCat) {
      const updatedCategoryList = this.value.filter(cat => cat !== deselectedCat);
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
    }
  }
};
</script>
