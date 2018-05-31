<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-${capability.typeData.effectNameOrPreset}`">

      <template slot="label">
        <template v-if="capability.typeData.effectNameOrPreset === `effectName`">
          Effect name / <a
            href="#effectPreset"
            class="button secondary inline"
            title="Choose effect preset instead of entering effect name manually"
            @click.prevent="changeEffectNameOrPreset(`effectPreset`)">preset</a>
        </template>
        <template v-else>
          Effect preset / <a
            href="#effectName"
            class="button secondary inline"
            title="Specify effect name manually instead of choosing effect preset"
            @click.prevent="changeEffectNameOrPreset(`effectName`)">name</a>
        </template>
      </template>

      <app-property-input-text
        v-if="capability.typeData.effectNameOrPreset === `effectName`"
        ref="effectNameOrPresetInput"
        v-model="capability.typeData.effectName"
        :formstate="formstate"
        :name="`capability${capability.uuid}-effectName`"
        :schema-property="properties.definitions.nonEmptyString" />

      <select
        v-else
        ref="effectNameOrPresetInput"
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

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-effectIntensity`"
      label="Effect intensity">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="effectIntensity" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="speed" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-duration`"
      label="Duration">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="duration" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-soundSensitvity`"
      label="Sound sensitivity">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="soundSensitvity" />
    </app-simple-label>

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
        effectNameOrPreset: `effectName`,
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
  },
  methods: {
    changeEffectNameOrPreset(newValue) {
      this.capability.typeData.effectNameOrPreset = newValue;
      this.$nextTick(() => this.$refs.effectNameOrPresetInput.focus());
    },
    cleanCapabilityData() {
      const resetProp = this.capability.typeData.effectNameOrPreset === `effectName` ? `effectPreset` : `effectName`;

      this.capability.typeData[resetProp] = this.defaultData[resetProp];
    }
  }
};
</script>
