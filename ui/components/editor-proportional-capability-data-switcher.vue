<template>
  <div class="proportional-capability-data">

    <!-- TODO: required fields, validation, custom inputs (using slots?) -->

    <template v-if="!hasStartEnd">
      <app-property-input-entity
        v-if="entitySchema"
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :schema-property="entitySchema" />

      <app-property-input-text
        v-else
        ref="steppedField"
        v-model="propertyDataStepped"
        :name="`capability${capability.uuid}-${propertyName}`"
        :schema-property="properties.definitions.nonEmptyString" />

      <span v-if="hint" class="hint">{{ hint }}</span>
    </template>

    <template v-else>
      <span class="entity-input">
        <app-property-input-entity
          v-if="entitySchema"
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :schema-property="entitySchema"
          hint="start" />

        <app-property-input-text
          v-else
          ref="startField"
          v-model="propertyDataStart"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :schema-property="properties.definitions.nonEmptyString"
          hint="start" />

        <span class="hint">
          {{ hint ? hint : `value` }} at
          {{ capability.dmxRange && capability.dmxRange[0] !== null ? `DMX value ${capability.dmxRange[0]}` : `capability start` }}
        </span>
      </span>

      <span class="separator">…</span>

      <span class="entity-input">
        <app-property-input-entity
          v-if="entitySchema"
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :schema-property="entitySchema"
          hint="end" />

        <app-property-input-text
          v-else
          ref="endField"
          v-model="propertyDataEnd"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :schema-property="properties.definitions.nonEmptyString"
          hint="end" />

        <span class="hint">
          {{ hint ? hint : `value` }} at
          {{ capability.dmxRange && capability.dmxRange[1] !== null ? `DMX value ${capability.dmxRange[1]}` : `capability end` }}
        </span>
      </span>
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
  margin: 0 1ex;
}
</style>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import propertyInputEntityVue from '~/components/property-input-entity.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';

export default {
  components: {
    'app-property-input-entity': propertyInputEntityVue,
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
      properties: schemaProperties
    };
  },
  computed: {
    entitySchema() {
      const capabilitySchema = this.properties.capabilityTypes[this.capability.type];
      if (!capabilitySchema) {
        return null;
      }

      const propertySchema = capabilitySchema.properties[this.propertyName];
      if (!propertySchema) {
        return null;
      }

      const entity = (propertySchema.$ref || ``).replace(`definitions.json#/entities/`, ``);
      if (entity === `` || entity === `index` || entity === `factor`) {
        return null;
      }

      return this.properties.entities[entity];
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
    }
  }
};
</script>
