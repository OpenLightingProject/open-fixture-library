<template>
  <span class="range">
    <!-- TODO: validate the individual sub fields -->
    <app-property-input-number
      type="number"
      :name="`${name}-start`"
      v-model="start"
      :schema-property="schemaProperty.items"
      :min="min"
      :max="end !== `invalid` ? end : max"
      :required="required || rangeIncomplete"
      :hint="startHint"
      @focus.native="onFocus"
      @blur.native="onBlur($event)"
      @focusin.native.stop
      @focusout.native.stop />
    …
    <app-property-input-number
      type="number"
      :name="`${name}-end`"
      v-model="end"
      :schema-property="schemaProperty.items"
      :min="start !== `invalid` ? start : min"
      :max="max"
      :required="required || rangeIncomplete"
      :hint="endHint"
      @focus.native="onFocus"
      @blur.native="onBlur($event)"
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
    name: {
      type: String,
      required: true
    },
    startHint: {
      type: String,
      required: false,
      default: `start`
    },
    endHint: {
      type: String,
      required: false,
      default: `end`
    },
    min: {
      type: Number,
      required: false,
      default: null
    },
    max: {
      type: Number,
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
        this.$emit(`start-updated`);
      }
    },
    end: {
      get() {
        return this.range ? this.range[1] : null;
      },
      set(endInput) {
        this.$emit(`input`, getRange(this.start, endInput));
        this.$emit(`end-updated`);
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
      if (!(event.target && event.relatedTarget) || event.target.closest(`.range`) !== event.relatedTarget.closest(`.range`)) {
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

