<template>
  <div class="proportional-capability-data">

    <Component
      :is="formstate ? 'Validate' : 'span'"
      v-if="hasStartEnd"
      :state="formstate"
      :tag="formstate ? 'span' : null">

      <Component
        :is="formstate ? 'Validate' : 'label'"
        :state="formstate"
        :tag="formstate ? 'label' : null"
        class="entity-input">

        <PropertyInputNumber
          v-if="entity === `slotNumber`"
          ref="startField"
          v-model="slotNumberStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="slotNumberSchema" />

        <PropertyInputEntity
          v-else-if="entitySchema"
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="entitySchema"
          :associated-entity="propertyDataEnd"
          @unit-selected="onUnitSelected($event)" />

        <PropertyInputText
          v-else
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="schemaDefinitions.nonEmptyString"
          :valid-color-hex-list="propertyName === `colorsHexString`"
          hint="start" />

        <span class="hint">
          {{ hint || `value` }} at
          {{ capability.dmxRange && capability.dmxRange[0] !== null ? `DMX value ${capability.dmxRange[0]}` : `capability start` }}
        </span>

      </Component>

      <span class="separator">
        <button
          :tabindex="swapButtonTabIndex"
          type="button"
          class="swap icon-button"
          title="Swap start and end values"
          @click.prevent="swapStartEnd()">
          <OflSvg name="swap-horizontal" />
        </button>
        …
      </span>

      <Component
        :is="formstate ? 'Validate' : 'label'"
        :state="formstate"
        :tag="formstate ? 'label' : null"
        class="entity-input">

        <PropertyInputNumber
          v-if="entity === `slotNumber`"
          ref="endField"
          v-model="slotNumberEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="slotNumberSchema" />

        <PropertyInputEntity
          v-else-if="entitySchema"
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="entitySchema"
          :associated-entity="propertyDataStart"
          @unit-selected="onUnitSelected($event)" />

        <PropertyInputText
          v-else
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="schemaDefinitions.nonEmptyString"
          :valid-color-hex-list="propertyName === `colorsHexString`"
          hint="end" />

        <span class="hint">
          {{ hint || `value` }} at
          {{ capability.dmxRange && capability.dmxRange[1] !== null ? `DMX value ${capability.dmxRange[1]}` : `capability end` }}
        </span>

      </Component>
    </Component>

    <template v-else>
      <PropertyInputNumber
        v-if="entity === `slotNumber`"
        ref="steppedField"
        v-model="slotNumberStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="slotNumberSchema" />

      <PropertyInputEntity
        v-else-if="entitySchema"
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="entitySchema" />

      <PropertyInputText
        v-else
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="schemaDefinitions.nonEmptyString"
        :valid-color-hex-list="propertyName === `colorsHexString`" />

      <span v-if="hint" class="hint">{{ hint }}</span>
    </template>

    <section>
      <label>
        <input v-model="hasStartEnd" type="checkbox" @change="focusEndField()">
        Specify range instead of a single value
      </label>
    </section>

  </div>
</template>

<style lang="scss" scoped>
.entity-input {
  display: inline-block;
  vertical-align: top;
}

.separator {
  position: relative;
  margin: 0 1ex;
  vertical-align: -8px;

  .icon-button.swap {
    position: absolute;
    bottom: 0;
    left: 50%;
    margin-left: -1rem;
    background: none;
    border: none;
  }
}

.proportional-capability-data {
  & .icon-button.swap {
    opacity: 0;
    transition-property: opacity, fill;
  }

  &:hover .icon-button.swap,
  & .icon-button.swap:focus {
    opacity: 1;
  }

  &:focus-within .icon-button.swap {
    opacity: 1;
  }
}
</style>

<script>
import { booleanProp, objectProp, stringProp } from 'vue-ts-types';
import {
  capabilityTypes,
  entitiesSchema,
  schemaDefinitions,
  unitsSchema,
} from '../../../lib/schema-properties.js';

import PropertyInputEntity from '../PropertyInputEntity.vue';
import PropertyInputNumber from '../PropertyInputNumber.vue';
import PropertyInputText from '../PropertyInputText.vue';

export default {
  components: {
    PropertyInputEntity,
    PropertyInputNumber,
    PropertyInputText,
  },
  props: {
    capability: objectProp().required,
    propertyName: stringProp().required,
    required: booleanProp().withDefault(false),
    hint: stringProp().optional,
    formstate: objectProp().optional,
  },
  data() {
    const slotNumberUnit = entitiesSchema.slotNumber.$ref.replace(`#/units/`, ``);

    return {
      schemaDefinitions,
      slotNumberSchema: unitsSchema[slotNumberUnit],
    };
  },
  computed: {
    entity() {
      const capabilitySchema = capabilityTypes[this.capability.type];
      if (!capabilitySchema) {
        return ``;
      }

      const propertySchema = capabilitySchema.properties[this.propertyName];
      if (!propertySchema) {
        return ``;
      }

      return (propertySchema.$ref || ``).replace(`definitions.json#/entities/`, ``);
    },
    entitySchema() {
      if (this.entity === ``) {
        return null;
      }

      return entitiesSchema[this.entity];
    },
    propertyDataStepped: {
      get() {
        return this.capability.typeData[this.propertyName];
      },
      set(newData) {
        this.capability.typeData[this.propertyName] = newData;
      },
    },
    propertyDataStart: {
      get() {
        return this.capability.typeData[`${this.propertyName}Start`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}Start`] = newData;
      },
    },
    propertyDataEnd: {
      get() {
        return this.capability.typeData[`${this.propertyName}End`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}End`] = newData;
      },
    },
    hasStartEnd: {
      get() {
        if (this.propertyDataStepped === null && this.propertyDataStart === null) {
          throw new Error(`Stepped and start value are both null. At least one of them should have a value, e.g. an empty string.`);
        }

        return this.propertyDataStepped === null;
      },
      set(shouldHaveStartEnd) {
        if (shouldHaveStartEnd && !this.hasStartEnd) {
          const savedData = this.propertyDataStepped;
          this.propertyDataStepped = null;
          this.propertyDataStart = savedData;
          this.propertyDataEnd = savedData;
        }
        else if (!shouldHaveStartEnd && this.hasStartEnd) {
          const savedData = this.propertyDataStart;
          this.propertyDataStepped = savedData;
          this.propertyDataStart = null;
          this.propertyDataEnd = null;
        }
      },
    },

    // slotNumber entity requires a bit of special handling
    slotNumberStepped: {
      get() {
        return this.capability.typeData[this.propertyName];
      },
      set(newData) {
        this.capability.typeData[this.propertyName] = newData === null ? `` : newData;
      },
    },
    slotNumberStart: {
      get() {
        return this.capability.typeData[`${this.propertyName}Start`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}Start`] = newData === null ? `` : newData;
      },
    },
    slotNumberEnd: {
      get() {
        return this.capability.typeData[`${this.propertyName}End`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}End`] = newData === null ? `` : newData;
      },
    },

    swapButtonTabIndex() {
      return (this.propertyDataStart === this.propertyDataEnd ||
        this.propertyDataStart === `` ||
        this.propertyDataEnd === ``) ? `-1` : null;
    },
  },
  methods: {
    /** @public */
    focus() {
      for (const field of [`steppedField`, `startField`, `endField`]) {
        if (this.$refs[field]) {
          this.$refs[field].focus();
          return;
        }
      }
    },
    async focusEndField() {
      await this.$nextTick();

      if (this.hasStartEnd) {
        const focusField = this.propertyDataStart === `` ? this.$refs.startField : this.$refs.endField;
        focusField.focus();
      }
    },
    onUnitSelected(newUnit) {
      if (!this.propertyDataStart.endsWith(newUnit)) {
        this.$refs.startField.setUnitString(newUnit);
      }
      if (!this.propertyDataEnd.endsWith(newUnit)) {
        this.$refs.endField.setUnitString(newUnit);
      }
    },
    swapStartEnd() {
      [this.propertyDataStart, this.propertyDataEnd] = [this.propertyDataEnd, this.propertyDataStart];
    },
  },
};
</script>
