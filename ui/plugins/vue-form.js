import Vue from 'vue';
import VueForm from 'vue-form';

Vue.use(VueForm, {
  validators: {
    'step'(value, stepValue) {
      return stepValue === 'any' || Number(value) % Number(stepValue) === 0;
    },
    'data-exclusive-minimum'(value, exclusiveMinimum) {
      return Number(value) > Number(exclusiveMinimum);
    },
    'data-exclusive-maximum'(value, exclusiveMaximum) {
      return Number(value) < Number(exclusiveMaximum);
    },
    'complete-range'(range) {
      return range === null || (range[0] !== null && range[1] !== null);
    },
    'valid-range'(range) {
      if (range === null) {
        // allowed range
        return true;
      }

      if (range[0] === null || range[1] === null) {
        // let complete-range validator handle this
        return true;
      }

      if (Number.isNaN(range[0]) || Number.isNaN(range[1])) {
        // let number validator handle this
        return true;
      }

      return range[0] <= range[1];
    },
    'categories-not-empty'(categories) {
      return categories.length > 0;
    },
    'complete-dimensions'(dimensions) {
      return dimensions === null || (dimensions[0] !== null && dimensions[1] !== null && dimensions[2] !== null);
    },
    'start-with-uppercase-or-number'(value) {
      return /^[\dA-Z]/.test(value);
    },
    'no-mode-name'(value) {
      return !/\bmode\b/i.test(value);
    },
    'no-fine-channel-name'(value) {
      if (/\bfine\b|\d+[\s_-]*bit/i.test(value)) {
        return false;
      }

      return !/\bLSB\b|\bMSB\b/.test(value);
    },
    'entity-complete'(value, attributeValue, vnode) {
      const component = vnode.componentInstance;

      if (component.hasNumber) {
        return component.selectedNumber !== '' && component.selectedNumber !== null;
      }

      return true;
    },
    'entities-have-same-units'(value, attributeValue, vnode) {
      return vnode.componentInstance.hasSameUnit;
    },
    'valid-color-hex-list'(value) {
      return /^\s*#[\da-f]{6}(?:\s*,\s*#[\da-f]{6})*\s*$/i.test(value);
    },
    'max-file-size'(file, attributeValue) {
      if (typeof file === 'object') {
        let maxSize = Number.parseInt(attributeValue, 10);

        if (attributeValue.includes('M')) {
          maxSize *= 1000 * 1000;
        }
        else if (attributeValue.includes('k')) {
          maxSize *= 1000;
        }

        return file.size <= maxSize;
      }

      return true;
    },
  },
});
