<template>
  <div class="capability-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-blade`"
      label="Blade">
      <app-property-input-entity
        v-model="capability.typeData.blade"
        :name="`capability${capability.uuid}-blade`"
        :schema-property="bladeSchema"
        :required="true" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-angle`"
      label="Angle">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="angle" />
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
        blade: ``,
        angle: null,
        angleStart: `0deg`,
        angleEnd: `360deg`,
        comment: ``
      }
    };
  },
  computed: {
    bladeSchema() {
      return this.properties.capabilityTypes.BladeInsertion.properties.blade;
    }
  }
};
</script>
