<template>
  <span class="dimensions">
    <!-- TODO: validate the individual sub fields -->
    <app-property-input-number
      ref="xInput"
      v-model="x"
      :schema-property="schemaProperty.items"
      :required="required || dimensionsIncomplete"
      :hint="hints[0]"
      @focus.native="onFocus"
      @blur.native="onBlur($event)"
      @focusin.native.stop
      @focusout.native.stop />
    &times;
    <app-property-input-number
      v-model="y"
      :schema-property="schemaProperty.items"
      :required="required || dimensionsIncomplete"
      :hint="hints[1]"
      @focus.native="onFocus"
      @blur.native="onBlur($event)"
      @focusin.native.stop
      @focusout.native.stop />
    &times;
    <app-property-input-number
      v-model="z"
      :schema-property="schemaProperty.items"
      :required="required || dimensionsIncomplete"
      :hint="hints[2]"
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
    prop: `dimensions`
  },
  props: {
    dimensions: {
      type: Array,
      required: false,
      default: null
    },
    hints: {
      type: Array,
      required: false,
      default: () => [`x`, `y`, `z`]
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
    x: {
      get() {
        return this.dimensions ? this.dimensions[0] : null;
      },
      set(xInput) {
        this.$emit(`input`, getDimensionsArray(xInput, this.y, this.z));
      }
    },
    y: {
      get() {
        return this.dimensions ? this.dimensions[1] : null;
      },
      set(yInput) {
        this.$emit(`input`, getDimensionsArray(this.x, yInput, this.z));
      }
    },
    z: {
      get() {
        return this.dimensions ? this.dimensions[2] : null;
      },
      set(zInput) {
        this.$emit(`input`, getDimensionsArray(this.x, this.y, zInput));
      }
    },
    dimensionsIncomplete() {
      return this.dimensions && (this.x === null || this.y === null || this.z === null);
    }
  },
  methods: {
    onFocus(event) {
      this.$emit(`focus`);
    },
    onBlur(event) {
      if (!(event.target && event.relatedTarget) || event.target.closest(`.dimensions`) !== event.relatedTarget.closest(`.dimensions`)) {
        this.$emit(`blur`);
      }
    },
    focus() {
      this.$refs.xInput.focus();
    }
  }
};

/**
 * @param {?number} x X value of the dimensions array or null.
 * @param {?number} y Y value of the dimensions array or null.
 * @param {?number} z Z value of the dimensions array or null.
 * @returns {?Array.<number>} Dimensions array with the inputs or null if all inputs were null.
 */
function getDimensionsArray(x, y, z) {
  if (x === null && y === null && z === null) {
    return null;
  }

  return [x, y, z];
}
</script>

