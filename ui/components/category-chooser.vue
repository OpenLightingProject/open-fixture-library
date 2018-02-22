<template>
  <div>
    <draggable v-model="selectedCategories" element="span">
      <app-category-badge
        v-for="cat in value"
        :key="cat"
        :category="cat"
        :selected="true"
        :selectable="true"
        @click="deselect(cat)"
        @focus="onFocus"
        @blur="onBlur" />
    </draggable>

    <app-category-badge
      v-for="cat in unselectedCategories"
      :key="cat"
      :category="cat"
      :selected="false"
      :selectable="true"
      @click="select(cat)"
      @focus="onFocus"
      @blur="onBlur" />
  </div>
</template>


<script>
import categoryBadgeVue from '~/components/category-badge.vue';

export default {
  components: {
    'app-category-badge': categoryBadgeVue
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
    onBlur() {
      this.$emit(`blur`);
    }
  }
};
</script>
