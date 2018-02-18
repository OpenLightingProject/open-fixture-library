<template>
  <div>
    <draggable v-model="selectedCategories" element="span">
      <app-category-badge
        v-for="cat in value"
        :key="cat"
        :category="cat"
        :selected="true"
        :selectable="true"
        @click="deselect(cat)" />
    </draggable>

    <app-category-badge
      v-for="cat in unselectedCategories"
      :key="cat"
      :category="cat"
      :selected="false"
      :selectable="true"
      @click="select(cat)" />

    <span class="hint">Select and reorder all applicable categories, the most suitable first.</span>
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
    },
    deselect(deselectedCat) {
      const updatedCategoryList = this.value.filter(cat => cat !== deselectedCat);
      this.$emit(`input`, updatedCategoryList);
    }
  }
};
</script>
