import Vue from 'vue';
import VueForm from 'vue-form';

Vue.use(VueForm, {
  validators: {
    'step': function(value, stepValue) {
      return stepValue === `any` || Number(value) % Number(stepValue) === 0;
    },
    'data-exclusive-minimum': function(value, exclusiveMinimum) {
      return Number(value) > Number(exclusiveMinimum);
    },
    'data-exclusive-maximum': function(value, exclusiveMaximum) {
      return Number(value) < Number(exclusiveMaximum);
    },
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
    },
    'start-with-uppercase-or-number': function(value) {
      return /^[A-Z0-9]/.test(value);
    },
    'no-mode-name': function(value) {
      return !/\bmode\b/i.test(value);
    },
    'no-fine-channel-name': function(value) {
      if (/\bfine\b|\d+(?:\s|-|_)*bit/i.test(value)) {
        return false;
      }

      return !/\bLSB\b|\bMSB\b/.test(value);
    },
    'entity-complete': function(value, attrValue, vnode) {
      const component = vnode.componentInstance;

      if (component.hasNumber) {
        return component.selectedNumber !== `` && component.selectedNumber !== null;
      }

      return true;
    }
  }
});
