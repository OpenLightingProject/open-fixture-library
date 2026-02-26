<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="speed" />
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
import { schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      speed?: string | null;
      speedStart?: string;
      speedEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const hint = `Doesn't activate strobe, only controls the strobe frequency when another channel is set to a ShutterStrobe capability with shutter effect 'Strobe'.`;

const defaultData = {
  speed: null,
  speedStart: 'Hz',
  speedEnd: 'Hz',
  comment: '',
};
</script>
