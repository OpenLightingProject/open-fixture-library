<template>
  <div class="capability-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-index`"
      label="Index">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="index" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Gobo name">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-labeled-input>

    <section>
      <label>
        <input v-model="capability.typeData.isShaking" type="checkbox"> Shaking Gobo
      </label>
    </section>

    <template v-if="capability.typeData.isShaking">
      <app-labeled-input
        :formstate="formstate"
        :name="`capability${capability.uuid}-shakeSpeed`"
        label="Shake Speed">
        <app-editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="shakeSpeed" />
      </app-labeled-input>

      <app-labeled-input
        :formstate="formstate"
        :name="`capability${capability.uuid}-shakeAngle`"
        label="Shake Angle">
        <app-editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="shakeAngle" />
      </app-labeled-input>
    </template>

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
        index: ``,
        indexStart: null,
        indexEnd: null,
        comment: ``,
        isShaking: false,
        shakeSpeed: ``,
        shakeSpeedStart: null,
        shakeSpeedEnd: null,
        shakeAngle: ``,
        shakeAngleStart: null,
        shakeAngleEnd: null
      }
    };
  },
  computed: {
    resetProps() {
      if (!this.capability.typeData.isShaking) {
        return [`shakeAngle`, `shakeAngleStart`, `shakeAngleEnd`, `shakeSpeed`, `shakeSpeedStart`, `shakeSpeedEnd`];
      }

      return [];
    }
  }
};
</script>
