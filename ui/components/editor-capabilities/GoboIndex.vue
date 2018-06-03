<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-index`"
      label="Index">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="index" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Gobo name">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-simple-label>

    <section>
      <label>
        <input v-model="capability.typeData.isShaking" type="checkbox"> Shaking Gobo
      </label>
    </section>

    <template v-if="capability.typeData.isShaking">
      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-shakeSpeed`"
        label="Shake Speed">
        <app-editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="shakeSpeed" />
      </app-simple-label>

      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-shakeAngle`"
        label="Shake Angle">
        <app-editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="shakeAngle" />
      </app-simple-label>
    </template>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-text': propertyInputTextVue,
    'app-simple-label': simpleLabelVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: true
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
  methods: {
    cleanCapabilityData() {
      if (!this.capability.typeData.isShaking) {
        const resetProps = [`shakeAngle`, `shakeAngleStart`, `shakeAngleEnd`, `shakeSpeed`, `shakeSpeedStart`, `shakeSpeedEnd`];
        for (const prop of resetProps) {
          this.capability.typeData[prop] = this.defaultData[prop];
        }
      }
    }
  }
};
</script>
