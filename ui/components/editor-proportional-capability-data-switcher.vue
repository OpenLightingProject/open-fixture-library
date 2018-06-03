<template>
  <div class="proportional-capability-data">

    <validate
      v-if="!hasStartEnd"
      :state="formstate"
      :custom="customValidators"
      tag="span">

      <app-property-input-number
        v-if="entity === `index`"
        ref="steppedField"
        v-model="indexStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="indexSchema" />

      <app-property-input-entity
        v-else-if="entitySchema"
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="entitySchema" />

      <app-property-input-text
        v-else
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :required="required"
        :schema-property="properties.definitions.nonEmptyString" />

      <span v-if="hint" class="hint">{{ hint }}</span>

    </validate>

    <template v-else>
      <!-- TODO: validate same unit -->

      <validate
        :state="formstate"
        :custom="customValidators"
        tag="span"
        class="entity-input">

        <app-property-input-number
          v-if="entity === `index`"
          ref="startField"
          v-model="indexStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="indexSchema" />

        <app-property-input-entity
          v-else-if="entitySchema"
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="entitySchema"
          hint="start" />

        <app-property-input-text
          v-else
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :required="required"
          :schema-property="properties.definitions.nonEmptyString"
          hint="start" />

        <span class="hint">
          {{ hint || `value` }} at
          {{ capability.dmxRange && capability.dmxRange[0] !== null ? `DMX value ${capability.dmxRange[0]}` : `capability start` }}
        </span>

      </validate>

      <span class="separator">
        <a
          href="#swap"
          class="swap"
          title="Swap start and end values"
          @click.prevent="swapStartEnd">
          <app-svg name="swap-horizontal" />
        </a>
        …
      </span>

      <validate
        :state="formstate"
        :custom="customValidators"
        tag="span"
        class="entity-input">

        <app-property-input-number
          v-if="entity === `index`"
          ref="endField"
          v-model="indexEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="indexSchema" />

        <app-property-input-entity
          v-else-if="entitySchema"
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="entitySchema"
          hint="end" />

        <app-property-input-text
          v-else
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :required="required"
          :schema-property="properties.definitions.nonEmptyString"
          hint="end" />

        <span class="hint">
          {{ hint || `value` }} at
          {{ capability.dmxRange && capability.dmxRange[1] !== null ? `DMX value ${capability.dmxRange[1]}` : `capability end` }}
        </span>

      </validate>
    </template>

    <section>
      <label>
        <input v-model="hasStartEnd" type="checkbox" @change="focusEndField">
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
  vertical-align: -8px;
  margin: 0 1ex;

  a.swap {
    position: absolute;
    bottom: 4px;
    left: -1px;
  }
}

.proportional-capability-data {
  & a.swap {
    opacity: 0;
    transition-property: opacity, fill;
  }

  &:hover a.swap,
  & a.swap:focus {
    opacity: 1;
  }

  &:focus-within a.swap {
    opacity: 1;
  }
}
</style>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import appSvg from '~/components/svg.vue';
import propertyInputEntityVue from '~/components/property-input-entity.vue';
import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';

export default {
  components: {
    'app-svg': appSvg,
    'app-property-input-entity': propertyInputEntityVue,
    'app-property-input-number': propertyInputNumberVue,
    'app-property-input-text': propertyInputTextVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    propertyName: {
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
    formstate: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      properties: schemaProperties,
      customValidators: null
    };
  },
  computed: {
    entity() {
      const capabilitySchema = this.properties.capabilityTypes[this.capability.type];
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

      return this.properties.entities[this.entity];
    },
    propertyDataStepped: {
      get() {
        return this.capability.typeData[this.propertyName];
      },
      set(newData) {
        this.capability.typeData[this.propertyName] = newData;
      }
    },
    propertyDataStart: {
      get() {
        return this.capability.typeData[`${this.propertyName}Start`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}Start`] = newData;
      }
    },
    propertyDataEnd: {
      get() {
        return this.capability.typeData[`${this.propertyName}End`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}End`] = newData;
      }
    },
    hasStartEnd: {
      get() {
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
      }
    },

    // index entity requires a bit of special handling
    indexSchema() {
      const unit = this.properties.entities.index.$ref.replace(`#/units/`, ``);
      console.log(unit);

      return this.properties.units[unit];
    },
    indexStepped: {
      get() {
        return this.capability.typeData[this.propertyName];
      },
      set(newData) {
        this.capability.typeData[this.propertyName] = newData === null ? `` : newData;
      }
    },
    indexStart: {
      get() {
        return this.capability.typeData[`${this.propertyName}Start`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}Start`] = newData === null ? `` : newData;
      }
    },
    indexEnd: {
      get() {
        return this.capability.typeData[`${this.propertyName}End`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}End`] = newData === null ? `` : newData;
      }
    }
  },
  methods: {
    focus() {
      for (const field of [`steppedField`, `startField`, `endField`]) {
        if (this.$refs[field]) {
          this.$refs[field].focus();
          return;
        }
      }
    },
    focusEndField() {
      this.$nextTick(() => {
        if (this.hasStartEnd) {
          const focusField = this.propertyDataStart === `` ? this.$refs.startField : this.$refs.endField;
          focusField.focus();
        }
      });
    },
    swapStartEnd() {
      [this.propertyDataStart, this.propertyDataEnd] = [this.propertyDataEnd, this.propertyDataStart];
    }
  }
};
</script>
