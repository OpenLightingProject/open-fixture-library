import Vue from 'vue';
import VueForm from 'vue-form';

Vue.use(VueForm, {
  validators: {
    'complete-range': function(range) {
      return range === null || (range[0] !== null && range[1] !== null);
    },
    'valid-range': function(range) {
      return range === null || range[0] === null || range[1] === null || range[0] <= range[1];
    }
  }
});
