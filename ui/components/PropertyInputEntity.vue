<template>
  <span :class="{ 'entity-input': true, 'has-number': hasNumber }">

    <Validate v-if="hasNumber" tag="span">
      <PropertyInputNumber
        ref="input"
        v-model="selectedNumber"
        :schema-property="units[selectedUnit].numberSchema"
        :required="true"
        :minimum="minNumber !== null ? minNumber : `invalid`"
        :maximum="maxNumber !== null ? maxNumber : `invalid`"
        :name="name ? `${name}-number` : null"
        @focus.native="onFocus()"
        @blur.native="onBlur($event)" />
    </Validate>

    <select
      ref="select"
      v-model="selectedUnit"
      :required="required"
      :class="{ empty: selectedUnit === `` }"
      @input="unitSelected()"
      @focus="onFocus()"
      @blur="onBlur($event)">

      <option :disabled="required" value="">unset</option>

      <optgroup v-if="enumValues.length" label="Keywords">
        <option
          v-for="enumValue of enumValues"
          :key="enumValue"
          :value="enumValue">{{ enumValue }}</option>
      </optgroup>

      <optgroup v-if="Object.keys(units).length" label="Units">
        <option
          v-for="({ displayString }, unitName) of units"
          :key="unitName"
          :value="unitName">{{ displayString }}</option>
      </optgroup>

    </select>
  </span>
</template>

<style lang="scss" scoped>
.entity-input {
  & select {
    width: 20ex;
  }
  &.wide select {
    width: 30ex;
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
  &.wide.has-number {
    & select {
      width: 15ex;
    }
    & input {
      width: 14ex;
      margin-right: 1ex;
    }
  }
}
</style>

<script>
import { unitsSchema } from '../../lib/schema-properties.js';

import PropertyInputNumber from './PropertyInputNumber.vue';

export default {
  components: {
    PropertyInputNumber,
  },
  props: {
    schemaProperty: {
      type: Object,
      required: true,
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    value: {
      type: null,
      required: false,
      default: ``,
    },
    associatedEntity: {
      type: null,
      required: false,
      default: ``,
    },
    minNumber: {
      type: Number,
      required: false,
      default: null,
    },
    maxNumber: {
      type: Number,
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      validationData: {
        'entity-complete': ``,
        'entities-have-same-units': ``,
      },
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
        subSchema => `$ref` in subSchema && subSchema.$ref.includes(`#/units/`),
      ).map(
        subSchema => subSchema.$ref.replace(/^(?:definitions\.json)?#\/units\//, ``),
      );
    },
    units() {
      const units = {};
      for (const unitName of this.unitNames) {
        const unitSchema = unitsSchema[unitName];

        const unitString = `pattern` in unitSchema ? unitSchema.pattern.replace(/^.*\)\??(.*?)\$$/, `$1`).replace(`\\`, ``) : ``;
        const numberSchema = `pattern` in unitSchema ? unitsSchema.number : unitSchema;

        units[unitName] = {
          unitString,
          displayString: getUnitDisplayString(unitString),
          numberSchema,
        };
      }

      return units;
    },
    selectedUnit: {
      get() {
        return getSelectedUnit(this.value, this.enumValues, this.unitNames, this.units);
      },
      set(newUnit) {
        if (this.enumValues.includes(newUnit) || newUnit === ``) {
          this.update(newUnit);
        }
        else if (this.units[newUnit].unitString === ``) {
          if (this.selectedNumber === ``) {
            this.update(`[no unit]`);
          }
          else {
            this.update(Number.parseFloat(this.selectedNumber));
          }
          this.$emit(`unit-selected`, `[no unit]`);
        }
        else {
          this.update(this.selectedNumber + this.units[newUnit].unitString);
          this.$emit(`unit-selected`, this.units[newUnit].unitString);
        }
      },
    },
    hasNumber() {
      return hasNumber(this.selectedUnit, this.enumValues);
    },
    selectedNumber: {
      get() {
        if (typeof this.value !== `string`) {
          return this.value;
        }

        const number = Number.parseFloat(this.value.replace(this.selectedUnit, ``));

        return Number.isNaN(number) ? `` : number;
      },
      set(newNumber) {
        if (newNumber === null || newNumber === `invalid`) {
          newNumber = ``;
        }

        if (this.units[this.selectedUnit].unitString === ``) {
          if (newNumber === ``) {
            this.update(`[no unit]`);
          }
          else {
            this.update(Number.parseFloat(newNumber));
          }
        }
        else {
          this.update(newNumber + this.units[this.selectedUnit].unitString);
        }
      },
    },

    /**
     * Used by vue-form's `entities-have-same-units` validation rule.
     * @public
     * @returns {Boolean} True if this and the associated entity have the same unit.
     */
    hasSameUnit() {
      if (!this.associatedEntity) {
        return true;
      }

      const otherFieldSelectedUnit = getSelectedUnit(this.associatedEntity, this.enumValues, this.unitNames, this.units);

      if (!this.hasNumber && !hasNumber(otherFieldSelectedUnit, this.enumValues)) {
        return true;
      }

      return this.selectedUnit === otherFieldSelectedUnit;
    },
  },
  mounted() {
    if (this.autoFocus) {
      this.focus();
    }

    this.$emit(`vf:validate`, this.validationData);
  },
  methods: {
    focus() {
      const focusField = this.$refs.input ? this.$refs.input : this.$refs.select;
      focusField.focus();
    },
    update(newValue) {
      this.$emit(`input`, newValue);
    },

    /**
     * Called by {@link EditorProportionalPropertySwitcher}
     * @param {String} newUnitString The unit string to set.
     * @public
     */
    setUnitString(newUnitString) {
      if (newUnitString === `[no unit]`) {
        newUnitString = ``;
      }

      this.selectedUnit = Object.keys(this.units).find(
        unitName => this.units[unitName].unitString === newUnitString,
      );
    },
    async unitSelected() {
      // wait for data to change locally (emits event)
      await this.$nextTick();

      // wait for new value from props
      await this.$nextTick();

      this.focus();
    },
    onFocus() {
      this.$emit(`focus`);
    },
    onBlur(event) {
      if (!(event.target && event.relatedTarget) || event.target.closest(`.entity-input`) !== event.relatedTarget.closest(`.entity-input`)) {
        this.$emit(`blur`);
      }
    },
  },
};

/**
 * @param {String} unitString The unit string, as required by the schema.
 * @returns {String} The unitString if it is not empty, `number` otherwise.
 */
function getUnitDisplayString(unitString) {
  if (unitString === ``) {
    return `number`;
  }

  return unitString.replace(`^2`, `²`).replace(`^3`, `³`);
}

/**
 * @param {String|Number|null} value The value to get the unit from.
 * @param {Array.<String>} enumValues List of allowed keywords.
 * @param {Array.<String>} unitNames List of names of allowed units.
 * @param {Object.<String, Object>} units Unit data by unit name.
 * @returns {String} The name of value's unit.
 */
function getSelectedUnit(value, enumValues, unitNames, units) {
  if (enumValues.includes(value) || value === ``) {
    return value;
  }

  if (value === `[no unit]` || typeof value !== `string`) {
    return unitNames.find(name => units[name].unitString === ``);
  }

  /* eslint-disable-next-line security/detect-unsafe-regex */ // because it's a bug in safe-regex
  const unit = value.replace(/^-?\d+(\.\d+)?/, ``);

  return unitNames.find(name => units[name].unitString === unit) || ``;
}

/**
 * @param {String} unitName A unit name or keyword.
 * @param {Array.<String>} enumValues List of allowed keywords.
 * @returns {Boolean} True if unitName indicates that a number is required.
 */
function hasNumber(unitName, enumValues) {
  return unitName !== `` && !enumValues.includes(unitName);
}
</script>
