<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-effectName`"
      label="Effect Name">
      <app-property-input-text
        v-model="capability.typeData.effectName"
        :formstate="formstate"
        :name="`capability${capability.uuid}-effectName`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-effectPreset`"
      label="Effect preset">
      <select
        v-model="capability.typeData.effectPreset"
        :class="{ empty: capability.typeData.effectPreset === `` }"
        :name="`capability${capability.uuid}-effectPreset`">

        <option value="" disabled>Please select an effect preset</option>
        <option
          v-for="effect in effectPresets"
          :key="effect"
          :value="effect">{{ effect }}</option>

      </select>
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-soundControlled`"
      label="Sound controlled?">
      <app-property-input-boolean
        v-model="capability.typeData.soundControlled"
        :schema-property="properties.capabilityTypes.Effect.properties.soundControlled"
        :name="`capability${capability.uuid}-soundControlled`" />
    </app-simple-label>

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="effectIntensity"
      property-display-name="Effect Intensity" />

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="speed"
      property-display-name="Speed" />

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="duration"
      property-display-name="Duration" />

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="soundSensitvity"
      property-display-name="Sound Sensitivity" />

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-simple-label>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputBooleanVue from '~/components/property-input-boolean.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-boolean': propertyInputBooleanVue,
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
        // TODO: allow either effectName or effectPreset
        effectName: ``,
        effectPreset: ``,
        soundControlled: null,
        effectIntensity: ``,
        effectIntensityStart: null,
        effectIntensityEnd: null,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        duration: ``,
        durationStart: null,
        durationEnd: null,
        soundSensitvity: ``,
        soundSensitvityStart: null,
        soundSensitvityEnd: null,
        comment: ``
      }
    };
  },
  computed: {
    effectPresets() {
      return this.properties.definitions.effectPreset.enum;
    }
  }
};
</script>
