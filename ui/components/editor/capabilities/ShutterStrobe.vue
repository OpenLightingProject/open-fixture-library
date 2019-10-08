<template>
  <div class="capability-type-data">

    <labeled-input
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
    </labeled-input>

    <template v-if="isStrobeEffect">
      <labeled-input
        :formstate="formstate"
        :name="`capability${capability.uuid}-soundControlled`"
        label="Sound-controlled?">
        <property-input-boolean
          v-model="capability.typeData.soundControlled"
          :schema-property="properties.capabilityTypes.ShutterStrobe.properties.soundControlled"
          :name="`capability${capability.uuid}-soundControlled`"
          label="Strobe is sound-controlled" />
      </labeled-input>

      <labeled-input
        :formstate="formstate"
        :multiple-inputs="true"
        :name="`capability${capability.uuid}-speed`"
        label="Speed">
        <editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="speed"
          entity="speed" />
      </labeled-input>

      <labeled-input
        :formstate="formstate"
        :multiple-inputs="true"
        :name="`capability${capability.uuid}-duration`"
        label="Duration">
        <editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="duration" />
      </labeled-input>

      <labeled-input
        :formstate="formstate"
        :name="`capability${capability.uuid}-randomTiming`"
        label="Random timing?">
        <property-input-boolean
          v-model="capability.typeData.randomTiming"
          :schema-property="properties.capabilityTypes.ShutterStrobe.properties.randomTiming"
          :name="`capability${capability.uuid}-randomTiming`"
          :label="`Random ${strobeEffectName}`" />
      </labeled-input>
    </template>

    <labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </labeled-input>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '../proportional-capability-data-switcher.vue';
import propertyInputBoolean from '../property-input-boolean.vue';
import propertyInputText from '../property-input-text.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'property-input-boolean': propertyInputBoolean,
    'property-input-text': propertyInputText,
    'labeled-input': labeledInput
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
