<template>
  <div class="capability-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-parameter`"
      label="Parameter">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="parameter" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-hold`"
      label="Hold">
      <app-property-input-entity
        v-model="capability.typeData.hold"
        :name="`capability${capability.uuid}-hold`"
        :schema-property="holdSchema" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-labeled-input>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputEntityVue from '~/components/property-input-entity.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-entity': propertyInputEntityVue,
    'app-property-input-text': propertyInputTextVue,
    'app-labeled-input': labeledInputVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      properties: schemaProperties,
      defaultData: {
        parameter: ``,
        parameterStart: null,
        parameterEnd: null,
        hold: ``,
        comment: ``
      }
    };
  },
  computed: {
    holdSchema() {
      const propertySchema = this.properties.capabilityTypes.Maintenance.properties.hold;
      const entityName = propertySchema.$ref.replace(`definitions.json#/entities/`, ``);

      return this.properties.entities[entityName];
    }
  }
};
</script>
