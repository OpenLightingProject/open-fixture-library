<template>
  <span>
    <app-property-input-number
      type="number"
      v-model="start"
      :schema-property="schemaProperty"
      :max="end"
      :required="required || rangeIncomplete"
      hint="min"
      @focus.native.stop="onFocus($event)"
      @blur.native.stop="onBlur($event)"
      @focusin.native.stop
      @focusout.native.stop />
    …
    <app-property-input-number
      type="number"
      v-model="end"
      :schema-property="schemaProperty"
      :min="start"
      :required="required || rangeIncomplete"
      hint="max"
      @focus.native.stop="onFocus($event)"
      @blur.native.stop="onBlur($event)"
      @focusin.native.stop
      @focusout.native.stop />
    {{ unit }}
  </span>
</template>

<script>
import propertyInputNumberVue from '~/components/property-input-number.vue';

export default {
  components: {
    'app-property-input-number': propertyInputNumberVue
  },
  model: {
    prop: `range`
  },
  props: {
    range: {
      type: Array,
      required: false,
      default: null
    },
    startHint: {
      type: String,
      required: false,
      default: null
    },
    endHint: {
      type: String,
      required: false,
      default: null
    },
    schemaProperty: {
      type: Object,
      required: true
    },
    unit: {
      type: String,
      required: false,
      default: null
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    start: {
      get() {
        return this.range ? this.range[0] : null;
      },
      set(startInput) {
        this.$emit(`input`, getRange(startInput, this.end));
      }
    },
    end: {
      get() {
        return this.range ? this.range[1] : null;
      },
      set(endInput) {
        this.$emit(`input`, getRange(this.start, endInput));
      }
    },
    rangeIncomplete() {
      return this.range && (this.start === null || this.end === null);
    }
  },
  methods: {
    onFocus(event) {
      this.$emit(`focus`);
    },
    onBlur(event) {
      if (!(event.target && event.relatedTarget) || event.target.parentNode !== event.relatedTarget.parentNode) {
        this.$emit(`blur`);
      }
    }
  }
};

/**
 * @param {?number} start Start value of the range or null.
 * @param {?number} end End value of the range or null.
 * @returns {?Array.<number>} Range array with the inputs or null if both inputs were null.
 */
function getRange(start, end) {
  if (start === null && end === null) {
    return null;
  }

  return [start, end];
}
</script>

