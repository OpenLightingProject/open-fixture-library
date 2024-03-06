<template>
  <span class="dimensions">
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        ref="xInput"
        v-model="x"
        :name="`${name}-x`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[0]"
        @focus="onFocus()"
        @blur="onBlur($event)" />
    </Validate>
    &times;
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        v-model="y"
        :name="`${name}-y`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[1]"
        @focus="onFocus()"
        @blur="onBlur($event)" />
    </Validate>
    &times;
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        v-model="z"
        :name="`${name}-z`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[2]"
        @focus="onFocus()"
        @blur="onBlur($event)" />
    </Validate>
    {{ unit }}
  </span>
</template>

<script>
import { arrayProp, booleanProp, objectProp, stringProp } from 'vue-ts-types';
import PropertyInputNumber from './PropertyInputNumber.vue';

export default {
  components: {
    PropertyInputNumber,
  },
  model: {
    prop: `model-value`,
    event: `update:model-value`,
  },
  props: {
    modelValue: arrayProp().withDefault(null),
    hints: arrayProp().withDefault(() => [`x`, `y`, `z`]),
    schemaProperty: objectProp().required,
    unit: stringProp().optional,
    required: booleanProp().withDefault(false),
    name: stringProp().required,
    formstate: objectProp().required,
  },
  emits: {
    'update:model-value': dimensions => true,
    focus: () => true,
    blur: () => true,
    'vf:validate': validationData => true,
  },
  data() {
    return {
      validationData: {
        'complete-dimensions': ``,
      },
    };
  },
  computed: {
    x: {
      get() {
        return this.modelValue ? this.modelValue[0] : null;
      },
      set(xInput) {
        this.$emit(`update:model-value`, getDimensionsArray(xInput, this.y, this.z));
      },
    },
    y: {
      get() {
        return this.modelValue ? this.modelValue[1] : null;
      },
      set(yInput) {
        this.$emit(`update:model-value`, getDimensionsArray(this.x, yInput, this.z));
      },
    },
    z: {
      get() {
        return this.modelValue ? this.modelValue[2] : null;
      },
      set(zInput) {
        this.$emit(`update:model-value`, getDimensionsArray(this.x, this.y, zInput));
      },
    },
    dimensionsSpecified() {
      return this.modelValue !== null;
    },
  },
  mounted() {
    this.$emit(`vf:validate`, this.validationData);
  },
  methods: {
    onFocus() {
      this.$emit(`focus`);
    },
    onBlur(event) {
      if (!(event.target && event.relatedTarget) || event.target.closest(`.dimensions`) !== event.relatedTarget.closest(`.dimensions`)) {
        this.$emit(`blur`);
      }
    },

    /** @public */
    focus() {
      this.$refs.xInput.focus();
    },
  },
};

/**
 * @param {number | null} x X value of the dimensions array or null.
 * @param {number | null} y Y value of the dimensions array or null.
 * @param {number | null} z Z value of the dimensions array or null.
 * @returns {[number, number, number] | null} Dimensions array with the inputs or null if all inputs were null.
 */
function getDimensionsArray(x, y, z) {
  if (x === null && y === null && z === null) {
    return null;
  }

  return [x, y, z];
}
</script>
