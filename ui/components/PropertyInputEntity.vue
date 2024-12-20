<template>
  <span class="entity-input" :class="{ 'has-number': hasNumber, wide }">

    <Validate v-if="hasNumber" tag="span">
      <PropertyInputNumber
        ref="input"
        v-model="selectedNumber"
        class="property-input-number"
        :schema-property="units[selectedUnit].numberSchema"
        required
        :minimum="minNumber !== undefined ? minNumber : `invalid`"
        :maximum="maxNumber !== undefined ? maxNumber : `invalid`"
        :name="name ? `${name}-number` : null"
        @focus="onFocus()"
        @blur="onBlur($event)" />
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

      <optgroup v-if="enumValues.length > 0" label="Keywords">
        <option
          v-for="enumValue of enumValues"
          :key="enumValue"
          :value="enumValue">{{ enumValue }}</option>
      </optgroup>

      <optgroup v-if="Object.keys(units).length > 0" label="Units">
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

    & .property-input-number {
      width: 9ex;
      margin-right: 1ex;
    }
  }

  &.wide.has-number {
    & select {
      width: 15ex;
    }

    & .property-input-number {
      width: 14ex;
      margin-right: 1ex;
    }
  }
}
</style>

<script>
import { anyProp, booleanProp, numberProp, objectProp, stringProp } from 'vue-ts-types';
import { unitsSchema } from '../../lib/schema-properties.js';

import PropertyInputNumber from './PropertyInputNumber.vue';

export default {
  components: {
    PropertyInputNumber,
  },
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    value: anyProp().withDefault(``),
    associatedEntity: anyProp().optional,
    minNumber: numberProp().optional,
    maxNumber: numberProp().optional,
    name: stringProp().required,
    wide: booleanProp().withDefault(false),
  },
  emits: {
    input: value => true,
    focus: () => true,
    blur: () => true,
    'unit-selected': unitString => true,
    'vf:validate': validationData => true,
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

        const unitString = `pattern` in unitSchema ? parseUnitFromPattern(unitSchema.pattern) : ``;
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
     * @returns {boolean} True if this and the associated entity have the same unit.
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
    this.$emit(`vf:validate`, this.validationData);
  },
  methods: {
    /** @public */
    focus() {
      const focusField = this.$refs.input ?? this.$refs.select;
      focusField.focus();
    },
    update(newValue) {
      this.$emit(`input`, newValue);
    },

    /**
     * Called by {@link EditorProportionalPropertySwitcher}
     * @param {string} newUnitString The unit string to set.
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
 * @param {string} pattern The pattern string to parse.
 * @returns {string} The unit string.
 */
function parseUnitFromPattern(pattern) {
  if (!pattern.endsWith(`$`)) {
    throw new Error(`Pattern does not end with '$': ${pattern}`);
  }

  const lastNumberPartIndex = Math.max(pattern.lastIndexOf(`)`), pattern.lastIndexOf(`?`));
  return pattern.slice(lastNumberPartIndex + 1, -1).replaceAll(`\\`, ``);
}

/**
 * @param {string} unitString The unit string, as required by the schema.
 * @returns {string} The unitString if it is not empty, `number` otherwise.
 */
function getUnitDisplayString(unitString) {
  if (unitString === ``) {
    return `number`;
  }

  return unitString.replace(`^2`, `²`).replace(`^3`, `³`);
}

/**
 * @param {string | number | null} value The value to get the unit from.
 * @param {string[]} enumValues List of allowed keywords.
 * @param {string[]} unitNames List of names of allowed units.
 * @param {Record<string, object>} units Unit data by unit name.
 * @returns {string} The name of value's unit.
 */
function getSelectedUnit(value, enumValues, unitNames, units) {
  if (enumValues.includes(value) || value === ``) {
    return value;
  }

  if (value === `[no unit]` || typeof value !== `string`) {
    return unitNames.find(name => units[name].unitString === ``);
  }

  const unit = value.replace(/^-?\d+(\.\d+)?/, ``);

  return unitNames.find(name => units[name].unitString === unit) || ``;
}

/**
 * @param {string} unitName A unit name or keyword.
 * @param {string[]} enumValues List of allowed keywords.
 * @returns {boolean} True if unitName indicates that a number is required.
 */
function hasNumber(unitName, enumValues) {
  return unitName !== `` && !enumValues.includes(unitName);
}
</script>
