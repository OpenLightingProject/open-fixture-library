<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-shutterEffect`"
      label="Shutter effect">
      <select
        v-model="capability.typeData.shutterEffect"
        :class="{ empty: capability.typeData.shutterEffect === `` }"
        :name="`capability${capability.uuid}-shutterEffect`"
        required>

        <option value="" disabled>Please select a shutter effect</option>
        <option
          v-for="effect in shutterEffects"
          :key="effect"
          :value="effect">{{ effect }}</option>

      </select>
    </LabeledInput>

    <template v-if="isStrobeEffect">
      <LabeledInput
        :formstate="formstate"
        :name="`capability${capability.uuid}-soundControlled`"
        label="Sound-controlled?">
        <PropertyInputBoolean
          v-model="capability.typeData.soundControlled"
          :schema-property="properties.capabilityTypes.ShutterStrobe.properties.soundControlled"
          :name="`capability${capability.uuid}-soundControlled`"
          label="Strobe is sound-controlled" />
      </LabeledInput>

      <LabeledInput
        :formstate="formstate"
        :multiple-inputs="true"
        :name="`capability${capability.uuid}-speed`"
        label="Speed">
        <EditorProportionalPropertySwitcher
          :capability="capability"
          :formstate="formstate"
          property-name="speed"
          entity="speed" />
      </LabeledInput>

      <LabeledInput
        :formstate="formstate"
        :multiple-inputs="true"
        :name="`capability${capability.uuid}-duration`"
        label="Duration">
        <EditorProportionalPropertySwitcher
          :capability="capability"
          :formstate="formstate"
          property-name="duration" />
      </LabeledInput>

      <LabeledInput
        :formstate="formstate"
        :name="`capability${capability.uuid}-randomTiming`"
        label="Random timing?">
        <PropertyInputBoolean
          v-model="capability.typeData.randomTiming"
          :schema-property="properties.capabilityTypes.ShutterStrobe.properties.randomTiming"
          :name="`capability${capability.uuid}-randomTiming`"
          :label="`Random ${strobeEffectName}`" />
      </LabeledInput>
    </template>

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';
import PropertyInputBoolean from '../PropertyInputBoolean.vue';
import PropertyInputText from '../PropertyInputText.vue';
import LabeledInput from '../../LabeledInput.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    PropertyInputBoolean,
    PropertyInputText,
    LabeledInput
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
        shutterEffect: ``,
        soundControlled: null,
        speed: null,
        speedStart: ``,
        speedEnd: ``,
        duration: ``,
        durationStart: null,
        durationEnd: null,
        randomTiming: null,
        comment: ``
      }
    };
  },
  computed: {
    shutterEffects() {
      return this.properties.capabilityTypes.ShutterStrobe.properties.shutterEffect.enum;
    },
    isStrobeEffect() {
      return ![``, `Open`, `Closed`].includes(this.capability.typeData.shutterEffect);
    },
    strobeEffectName() {
      return this.capability.typeData.shutterEffect === `Strobe`
        ? `Strobe`
        : `${this.capability.typeData.shutterEffect} Strobe`;
    },
    resetProps() {
      if (!this.isStrobeEffect) {
        return [
          `soundControlled`,
          `speed`,
          `speedStart`,
          `speedEnd`,
          `duration`,
          `durationStart`,
          `durationEnd`,
          `randomTiming`
        ];
      }

      return [];
    }
  }
};
</script>
