<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-${capability.typeData.speedOrDuration}`">

      <template #label>
        <template v-if="capability.typeData.speedOrDuration === `duration`">
          Duration / <a
            href="#speed"
            class="button secondary inline"
            title="Specify speed instead of duration"
            @click.prevent="changeSpeedOrDuration(`speed`)">Speed</a>
        </template>
        <template v-else>
          Speed / <a
            href="#duration"
            class="button secondary inline"
            title="Specify duration instead of speed"
            @click.prevent="changeSpeedOrDuration(`duration`)">Duration</a>
        </template>
      </template>

      <EditorProportionalPropertySwitcher
        v-if="capability.typeData.speedOrDuration"
        ref="speedOrDurationInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrDuration"
        required />

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
      speedOrDuration?: string;
      speed?: string | null;
      speedStart?: string;
      speedEnd?: string;
      duration?: string;
      durationStart?: string | null;
      durationEnd?: string | null;
      comment?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();
const speedOrDurationInput = ref<any>(null);

const defaultData = {
  speedOrDuration: 'speed',
  speed: null,
  speedStart: 'fast',
  speedEnd: 'slow',
  duration: '',
  durationStart: null,
  durationEnd: null,
  comment: '',
};

const resetProperties = computed(() => {
  const resetProperty = props.capability.typeData.speedOrDuration === 'duration' ? 'speed' : 'duration';
  return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
});

async function changeSpeedOrDuration(newValue: string) {
  props.capability.typeData.speedOrDuration = newValue;

  await nextTick();
  if (speedOrDurationInput.value) {
    speedOrDurationInput.value.focus();
  }
}
</script>
