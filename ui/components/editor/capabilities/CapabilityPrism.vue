<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-${capability.typeData.speedOrAngle}`">

      <template #label>
        <template v-if="capability.typeData.speedOrAngle === `speed`">
          Speed / <a
            href="#anglr"
            class="button secondary inline"
            title="Specify angle instead of speed"
            @click.prevent="changeSpeedOrAngle(`angle`)">Angle</a>
        </template>
        <template v-else>
          Angle / <a
            href="#speed"
            class="button secondary inline"
            title="Specify speed instead of angle"
            @click.prevent="changeSpeedOrAngle(`speed`)">Speed</a>
        </template>
      </template>

      <EditorProportionalPropertySwitcher
        v-if="capability.typeData.speedOrAngle"
        ref="speedOrAngleInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrAngle" />

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

interface Properties {
  capability: {
    uuid: string;
    typeData: {
      speedOrAngle?: string;
      speed?: string;
      speedStart?: string | null;
      speedEnd?: string | null;
      angle?: string;
      angleStart?: string | null;
      angleEnd?: string | null;
      comment?: string;
    };
  };
  formstate?: object;
}

const properties = defineProps<Properties>();
const speedOrAngleInput = ref<any>(null);

const defaultData = {
  speedOrAngle: 'speed',
  speed: '',
  speedStart: null,
  speedEnd: null,
  angle: '',
  angleStart: null,
  angleEnd: null,
  comment: '',
};

const resetProperties = computed(() => {
  const resetProperty = properties.capability.typeData.speedOrAngle === 'speed' ? 'angle' : 'speed';
  return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
});

/**
 * Stores the selected speed or angle mode and refocuses the input.
 * @param newValue - The selected value.
 */
async function changeSpeedOrAngle(newValue: string) {
  properties.capability.typeData.speedOrAngle = newValue;

  await nextTick();
  if (speedOrAngleInput.value) {
    speedOrAngleInput.value.focus();
  }
}

defineExpose({
  defaultData,
  resetProperties,
});
</script>
