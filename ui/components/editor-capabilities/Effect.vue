<template>
  <div class="capability-type-data">

    <app-labeled-input
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
        :schema-property="properties.definitions.nonEmptyString"
        :required="true" />

      <select
        v-else
        ref="effectNameOrPresetInput"
        v-model="capability.typeData.effectPreset"
        :class="{ empty: capability.typeData.effectPreset === `` }"
        :name="`capability${capability.uuid}-effectPreset`"
        required>

        <option value="" disabled>Please select an effect preset</option>
        <option
          v-for="effect in effectPresets"
          :key="effect"
          :value="effect">{{ effect }}</option>

      </select>

    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="speed" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-duration`"
      label="Duration">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="duration" />
    </app-labeled-input>

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
      :name="`capability${capability.uuid}-soundControlled`"
      label="Sound controlled?">
      <app-property-input-boolean
        v-model="capability.typeData.soundControlled"
        :schema-property="properties.capabilityTypes.Effect.properties.soundControlled"
        :name="`capability${capability.uuid}-soundControlled`" />
    </app-labeled-input>

    <app-labeled-input
      v-if="capability.typeData.soundControlled"
      :formstate="formstate"
      :name="`capability${capability.uuid}-soundSensitivity`"
      label="Sound sensitivity">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="soundSensitivity" />
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
import propertyInputBooleanVue from '~/components/property-input-boolean.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-boolean': propertyInputBooleanVue,
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
        effectNameOrPreset: `effectName`,
        effectName: ``,
        effectPreset: ``,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        duration: ``,
        durationStart: null,
        durationEnd: null,
        parameter: ``,
        parameterStart: null,
        parameterEnd: null,
        soundControlled: null,
        soundSensitivity: ``,
        soundSensitivityStart: null,
        soundSensitivityEnd: null,
        comment: ``
      }
    };
  },
  computed: {
    effectPresets() {
      return this.properties.definitions.effectPreset.enum;
    },
    resetProps() {
      const resetProps = [this.capability.typeData.effectNameOrPreset === `effectName` ? `effectPreset` : `effectName`];

      if (!this.capability.typeData.soundControlled) {
        resetProps.push(`soundSensitivity`, `soundSensitivityStart`, `soundSensitivityEnd`);
      }

      return resetProps;
    }
  },
  methods: {
    changeEffectNameOrPreset(newValue) {
      this.capability.typeData.effectNameOrPreset = newValue;
      this.$nextTick(() => this.$refs.effectNameOrPresetInput.focus());
    }
  }
};
</script>
