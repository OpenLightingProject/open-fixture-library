<template>
  <span :class="{ 'entity-input': true, 'has-number': hasNumber }">

    <input
      v-if="hasNumber"
      ref="input"
      v-model="selectedNumber"
      required
      type="number">

    <select
      ref="select"
      v-model="selectedUnit"
      :required="required"
      :class="{empty: selectedUnit === ``}"
      @input="unitSelected">

      <option :disabled="required" value="">unset</option>

      <optgroup label="Keywords">
        <option
          v-for="enumValue in enumValues"
          :key="enumValue"
          :value="enumValue">{{ enumValue }}</option>
      </optgroup>

      <optgroup label="Units">
        <option
          v-for="(unit, unitName) in units"
          :key="unitName"
          :value="unitName">{{ unit }}</option>
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

export default {
  props: {
    entity: {
      type: String,
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
      return this.properties.entities[this.entity].oneOf || [this.properties.entities[this.entity]];
    },
    enumValues() {
      const enumSubSchema = this.subSchemas.find(subSchema => `enum` in subSchema);

      return enumSubSchema.enum || null;
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
        const unit = this.properties.units[unitName].pattern.replace(`^-?[0-9]+(\\.[0-9]+)?`, ``).replace(/\$$/, ``);
        units[unitName] = unit;
      }

      return units;
    },
    selectedUnit: {
      get() {
        if (this.enumValues.includes(this.value)) {
          return this.value;
        }

        /* eslint-disable-next-line security/detect-unsafe-regex */ // because it's a bug in safe-regex
        const unit = this.value.replace(/^-?[0-9]+(\.[0-9]+)?/, ``);

        for (const unitName of Object.keys(this.units)) {
          if (this.units[unitName] === unit) {
            return unitName;
          }
        }

        return ``;
      },
      set(newUnit) {
        if (this.enumValues.includes(newUnit) || newUnit === ``) {
          this.update(newUnit);
        }
        else {
          this.update(this.selectedNumber + this.units[newUnit]);
        }
      }
    },
    hasNumber() {
      return this.selectedUnit !== `` && !this.enumValues.includes(this.selectedUnit);
    },
    selectedNumber: {
      get() {
        return parseFloat(this.value.replace(this.selectedUnit, ``)) || ``;
      },
      set(newNumber) {
        this.update(newNumber + this.units[this.selectedUnit]);
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
</script>

