<template>
  <div class="proportional-capability-data">
    <section>
      <label>
        <input v-model="hasStartEnd" type="checkbox">
        Specify {{ propertyDisplayName }} range instead of a single value
      </label>
    </section>

    <app-simple-label
      v-if="!hasStartEnd"
      :formstate="formstate"
      :name="`capability${capability.uuid}-${propertyName}`"
      :label="propertyDisplayName">
      <!-- TODO: required fields, unit inputs, custom inputs (using slots?) -->
      <app-property-input-text
        v-model="propertyDataStepped"
        :formstate="formstate"
        :name="`capability${capability.uuid}-${propertyName}`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-simple-label>

    <template v-else>
      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-${propertyName}Start`"
        :label="`${propertyDisplayName} start`">
        <app-property-input-text
          v-model="propertyDataStart"
          :formstate="formstate"
          :name="`capability${capability.uuid}-${propertyName}Start`"
          :schema-property="properties.definitions.nonEmptyString" />
      </app-simple-label>
      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-${propertyName}End`"
        :label="`${propertyDisplayName} end`">
        <app-property-input-text
          v-model="propertyDataEnd"
          :formstate="formstate"
          :name="`capability${capability.uuid}-${propertyName}End`"
          :schema-property="properties.definitions.nonEmptyString" />
      </app-simple-label>
    </template>
  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';

export default {
  components: {
    'app-property-input-text': propertyInputTextVue,
    'app-simple-label': simpleLabelVue
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
    propertyDisplayName: {
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
      properties: schemaProperties
    };
  },
  computed: {
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
  render(createElement) {
    if (this.$slots.default) {
      return createElement(`details`, [
        createElement(`summary`, this.$slots.summary),
        this.$slots.default
      ]);
    }

    return createElement(`div`, this.$slots.summary);
  }
};
</script>
