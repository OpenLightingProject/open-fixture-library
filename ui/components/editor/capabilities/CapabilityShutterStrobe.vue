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
          v-for="effect of shutterEffects"
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
          :name="`capability${capability.uuid}-soundControlled`"
          label="Strobe is sound-controlled" />
      </LabeledInput>

      <LabeledInput
        :formstate="formstate"
        multiple-inputs
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
        multiple-inputs
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
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import { objectProp } from 'vue-ts-types';
import { capabilityTypes, schemaDefinitions } from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputBoolean from '../../PropertyInputBoolean.vue';
import PropertyInputText from '../../PropertyInputText.vue';
import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputBoolean,
    PropertyInputText,
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      schemaDefinitions,
      shutterEffects: capabilityTypes.ShutterStrobe.properties.shutterEffect.enum,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
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
        comment: ``,
      },
    };
  },
  computed: {
    isStrobeEffect() {
      return ![``, `Open`, `Closed`].includes(this.capability.typeData.shutterEffect);
    },
    strobeEffectName() {
      return this.capability.typeData.shutterEffect === `Strobe`
        ? `Strobe`
        : `${this.capability.typeData.shutterEffect} Strobe`;
    },

    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      if (!this.isStrobeEffect) {
        return [
          `soundControlled`,
          `speed`,
          `speedStart`,
          `speedEnd`,
          `duration`,
          `durationStart`,
          `durationEnd`,
          `randomTiming`,
        ];
      }

      return [];
    },
  },
};
</script>
