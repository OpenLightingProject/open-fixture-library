<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-${capability.typeData.effectNameOrPreset}`">

      <template #label>
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

      <PropertyInputText
        v-if="capability.typeData.effectNameOrPreset === `effectName`"
        ref="effectNameOrPresetInput"
        v-model="capability.typeData.effectName"
        :formstate="formstate"
        :name="`capability${capability.uuid}-effectName`"
        :schema-property="schemaDefinitions.nonEmptyString"
        required />

      <select
        v-else
        ref="effectNameOrPresetInput"
        v-model="capability.typeData.effectPreset"
        :class="{ empty: capability.typeData.effectPreset === `` }"
        :name="`capability${capability.uuid}-effectPreset`"
        required>

        <option value="" disabled>Please select an effect preset</option>
        <option
          v-for="effect of effectPresets"
          :key="effect"
          :value="effect">{{ effect }}</option>

      </select>

    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="speed" />
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
      multiple-inputs
      :name="`capability${capability.uuid}-parameter`"
      label="Parameter">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="parameter" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-soundControlled`"
      label="Sound-controlled?">
      <PropertyInputBoolean
        v-model="capability.typeData.soundControlled"
        :name="`capability${capability.uuid}-soundControlled`"
        label="Effect is sound-controlled" />
    </LabeledInput>

    <LabeledInput
      v-if="capability.typeData.soundControlled"
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-soundSensitivity`"
      label="Sound sensitivity">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="soundSensitivity" />
    </LabeledInput>

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
import { nextTick } from 'vue';
import { schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      effectNameOrPreset?: string;
      effectName?: string;
      effectPreset?: string;
      speed?: string;
      speedStart?: string | null;
      speedEnd?: string | null;
      duration?: string;
      durationStart?: string | null;
      durationEnd?: string | null;
      parameter?: string;
      parameterStart?: string | null;
      parameterEnd?: string | null;
      soundControlled?: boolean | null;
      soundSensitivity?: string;
      soundSensitivityStart?: string | null;
      soundSensitivityEnd?: string | null;
      comment?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();
const effectNameOrPresetInput = ref<HTMLInputElement | HTMLSelectElement | null>(null);

const effectPresets = schemaDefinitions.effectPreset.enum;

const defaultData = {
  effectNameOrPreset: 'effectName',
  effectName: '',
  effectPreset: '',
  speed: '',
  speedStart: null,
  speedEnd: null,
  duration: '',
  durationStart: null,
  durationEnd: null,
  parameter: '',
  parameterStart: null,
  parameterEnd: null,
  soundControlled: null,
  soundSensitivity: '',
  soundSensitivityStart: null,
  soundSensitivityEnd: null,
  comment: '',
};

const resetProperties = computed(() => {
  const propsToReset = [props.capability.typeData.effectNameOrPreset === 'effectName' ? 'effectPreset' : 'effectName'];

  if (!props.capability.typeData.soundControlled) {
    propsToReset.push('soundSensitivity', 'soundSensitivityStart', 'soundSensitivityEnd');
  }

  return propsToReset;
});

async function changeEffectNameOrPreset(newValue: string) {
  props.capability.typeData.effectNameOrPreset = newValue;

  await nextTick();
  if (effectNameOrPresetInput.value) {
    (effectNameOrPresetInput.value as { focus: () => void }).focus();
  }
}
</script>
