<template>
  <span :class="{ 'entity-input': true, 'has-number': hasNumber }">

    <app-property-input-number
      v-if="hasNumber"
      ref="input"
      v-model="selectedNumber"
      :schema-property="units[selectedUnit].numberSchema"
      :required="true" />

    <select
      ref="select"
      v-model="selectedUnit"
      :required="required"
      :class="{empty: selectedUnit === ``}"
      @input="unitSelected">

      <option :disabled="required" value="">unset</option>

      <optgroup v-if="enumValues.length" label="Keywords">
        <option
          v-for="enumValue in enumValues"
          :key="enumValue"
          :value="enumValue">{{ enumValue }}</option>
      </optgroup>

      <optgroup v-if="Object.keys(units).length" label="Units">
        <option
          v-for="({ displayStr }, unitName) in units"
          :key="unitName"
          :value="unitName">{{ displayStr }}</option>
      </optgroup>

    </select>
  </span>
</template>

<style lang="scss" scoped>
.entity-input {
  & select {
    width: 20ex;
  }

  &.has-number {
    & select {
      width: 10ex;
    }
    & input {
      width: 9ex;
      margin-right: 1ex;
    }
  }
}
</style>

<script>
import schemaProperties from '~~/lib/schema-properties.js';
import propertyInputNumberVue from '~/components/property-input-number.vue';

export default {
  components: {
    'app-property-input-number': propertyInputNumberVue
  },
  props: {
    schemaProperty: {
      type: Object,
      required: true
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    hint: {
      type: String,
      required: false,
      default: null
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false
    },
    value: {
      type: null,
      required: false,
      default: ``
    }
  },
  data() {
    return {
      properties: schemaProperties
    };
  },
  computed: {
    subSchemas() {
      return this.schemaProperty.oneOf || [this.schemaProperty];
    },
    enumValues() {
      const enumSubSchema = this.subSchemas.find(subSchema => `enum` in subSchema);

      return enumSubSchema ? enumSubSchema.enum : [];
    },
    unitNames() {
      return this.subSchemas.filter(
        subSchema => `$ref` in subSchema && subSchema.$ref.startsWith(`#/units/`)
      ).map(
        subSchema => subSchema.$ref.replace(`#/units/`, ``)
      );
    },
    units() {
      const units = {};
      for (const unitName of this.unitNames) {
        const unitSchema = this.properties.units[unitName];

        const unitStr = `pattern` in unitSchema ? unitSchema.pattern.replace(`^-?[0-9]+(\\.[0-9]+)?`, ``).replace(/\$$/, ``) : ``;
        const numberSchema = `pattern` in unitSchema ? this.properties.units.number : unitSchema;

        units[unitName] = {
          unitStr,
          displayStr: getUnitDisplayString(unitStr),
          numberSchema
        };
      }

      return units;
    },
    selectedUnit: {
      get() {
        if (this.enumValues.includes(this.value) || this.value === ``) {
          return this.value;
        }

        if (this.value === `[no unit]` || typeof this.value !== `string`) {
          return this.unitNames.find(name => this.units[name].unitStr === ``);
        }

        /* eslint-disable-next-line security/detect-unsafe-regex */ // because it's a bug in safe-regex
        const unit = this.value.replace(/^-?[0-9]+(\.[0-9]+)?/, ``);

        return this.unitNames.find(name => this.units[name].unitStr === unit) || ``;
      },
      set(newUnit) {
        if (this.enumValues.includes(newUnit) || newUnit === ``) {
          this.update(newUnit);
        }
        else if (this.units[newUnit].unitStr === ``) {
          if (this.selectedNumber === ``) {
            this.update(`[no unit]`);
          }
          else {
            this.update(parseFloat(this.selectedNumber));
          }
        }
        else {
          this.update(this.selectedNumber + this.units[newUnit].unitStr);
        }
      }
    },
    hasNumber() {
      return this.selectedUnit !== `` && !this.enumValues.includes(this.selectedUnit);
    },
    selectedNumber: {
      get() {
        if (typeof this.value !== `string`) {
          return this.value;
        }

        return parseFloat(this.value.replace(this.selectedUnit, ``)) || ``;
      },
      set(newNumber) {
        if (this.units[this.selectedUnit].unitStr === ``) {
          if (newNumber === ``) {
            this.update(`[no unit]`);
          }
          else {
            this.update(parseFloat(newNumber));
          }
        }
        else {
          this.update(newNumber + this.units[this.selectedUnit].unitStr);
        }
      }
    }
    // validationData() {
    //   return {
    //     pattern: `pattern` in this.schemaProperty ? `${this.schemaProperty.pattern}` : null,
    //     minlength: `minLength` in this.schemaProperty ? `${this.schemaProperty.minLength}` : null,
    //     maxlength: `maxLength` in this.schemaProperty ? `${this.schemaProperty.maxLength}` : null
    //   };
    // }
  },
  mounted() {
    if (this.autoFocus) {
      this.focus();
    }

    // this.$watch(`validationData`, function(newValidationData) {
    //   this.$emit(`vf:validate`, newValidationData);
    // }, {
    //   deep: true,
    //   immediate: true
    // });
  },
  methods: {
    focus() {
      const focusField = this.$refs.input ? this.$refs.input : this.$refs.select;
      focusField.focus();
    },
    update(newValue) {
      this.$emit(`input`, newValue);
    },
    unitSelected() {
      // 1st nextTick for data change locally (emits event), 2nd nextTick for new value from props
      this.$nextTick(() => this.$nextTick(() => this.focus()));
    }
  }
};

/**
 * @param {!string} unitString The unit string, as required by the schema.
 * @returns {!string} The unitString if it is not empty, `no unit` otherwise.
 */
function getUnitDisplayString(unitString) {
  if (unitString === ``) {
    return `no unit`;
  }

  return unitString;
}
</script>

