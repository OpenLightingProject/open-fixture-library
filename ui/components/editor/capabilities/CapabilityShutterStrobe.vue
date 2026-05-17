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

<script setup lang="ts">
import { capabilityTypes, schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      shutterEffect?: string;
      soundControlled?: boolean | null;
      speed?: string | null;
      speedStart?: string;
      speedEnd?: string;
      duration?: string;
      durationStart?: string | null;
      durationEnd?: string | null;
      randomTiming?: boolean | null;
      comment?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();

const shutterEffects = capabilityTypes.ShutterStrobe.properties.shutterEffect.enum;

const defaultData = {
  shutterEffect: '',
  soundControlled: null,
  speed: null,
  speedStart: '',
  speedEnd: '',
  duration: '',
  durationStart: null,
  durationEnd: null,
  randomTiming: null,
  comment: '',
};

const isStrobeEffect = computed(() => {
  return ['', 'Open', 'Closed'].includes(props.capability.typeData.shutterEffect as string) === false;
});

const strobeEffectName = computed(() => {
  return props.capability.typeData.shutterEffect === 'Strobe'
    ? 'Strobe'
    : `${props.capability.typeData.shutterEffect} Strobe`;
});

const resetProperties = computed(() => {
  if (!isStrobeEffect.value) {
    return [
      'soundControlled',
      'speed',
      'speedStart',
      'speedEnd',
      'duration',
      'durationStart',
      'durationEnd',
      'randomTiming',
    ];
  }
  return [];
});
</script>
