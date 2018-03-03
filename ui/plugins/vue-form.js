import Vue from 'vue';
import VueForm from 'vue-form';

Vue.use(VueForm, {
  validators: {
    'complete-range': function(range) {
      return range === null || (range[0] !== null && range[1] !== null);
    },
    'valid-range': function(range) {
      if (range === null) {
        // allowed range
        return true;
      }

      if (range[0] === null || range[1] === null) {
        // let complete-range validator handle this
        return true;
      }

      if (isNaN(range[0]) || isNaN(range[1])) {
        // let number validator handle this
        return true;
      }

      return range[0] <= range[1];
    },
    'categories-not-empty': function(categories) {
      return categories.length > 0;
    },
    'complete-dimensions': function(dimensions) {
      return dimensions === null || (dimensions[0] !== null && dimensions[1] !== null && dimensions[2] !== null);
    }
  }
});
