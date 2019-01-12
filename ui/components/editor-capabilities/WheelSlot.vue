<template>
  <div class="capability-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-slotNumber`"
      label="Slot number">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="slotNumber" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-slot-type`"
      label="Slot type">
      <select
        v-model="capability.typeData.slotType"
        :class="{ empty: capability.typeData.slotType === `` }"
        :name="`capability${capability.uuid}-slotType`"
        :required="true">

        <option value="" disabled>Please select a slot type</option>

        <option
          v-for="type in slotTypes"
          :key="type"
          :value="type">{{ type }}</option>

      </select>
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
import propertyInputTextVue from '~/components/property-input-text.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-text': propertyInputTextVue,
    'app-labeled-input': labeledInputVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    channel: {
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
        slotNumber: ``,
        slotNumberStart: null,
        slotNumberEnd: null,
        slotType: ``,
        comment: ``
      }
    };
  },
  computed: {
    slotTypes() {
      return this.properties.wheelSlot.type.enum;
    }
  }
};
</script>
