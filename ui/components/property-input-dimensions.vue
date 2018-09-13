<template>
  <span class="dimensions">
    <validate :state="formstate" tag="span">
      <app-property-input-number
        ref="xInput"
        v-model="x"
        :name="`${name}-x`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[0]"
        @focus.native="onFocus"
        @blur.native="onBlur($event)" />
    </validate>
    &times;
    <validate :state="formstate" tag="span">
      <app-property-input-number
        v-model="y"
        :name="`${name}-y`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[1]"
        @focus.native="onFocus"
        @blur.native="onBlur($event)" />
    </validate>
    &times;
    <validate :state="formstate" tag="span">
      <app-property-input-number
        v-model="z"
        :name="`${name}-z`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[2]"
        @focus.native="onFocus"
        @blur.native="onBlur($event)" />
    </validate>
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
    },
    name: {
      type: String,
      required: true
    },
    formstate: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      validationData: {
        'complete-dimensions': ``
      }
    };
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
    dimensionsSpecified() {
      return this.dimensions !== null;
    }
  },
  mounted() {
    this.$emit(`vf:validate`, this.validationData);
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
 * @param {number|null} x X value of the dimensions array or null.
 * @param {number|null} y Y value of the dimensions array or null.
 * @param {number|null} z Z value of the dimensions array or null.
 * @returns {array.<number>|null} Dimensions array with the inputs or null if all inputs were null.
 */
function getDimensionsArray(x, y, z) {
  if (x === null && y === null && z === null) {
    return null;
  }

  return [x, y, z];
}
</script>

