<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-${capability.typeData.speedOrAngle}`">

      <template #label>
        <template v-if="capability.typeData.speedOrAngle === `speed`">
          Speed / <a
            href="#angle"
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
        :property-name="capability.typeData.speedOrAngle"
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
      speedOrAngle?: string;
      speed?: string | null;
      speedStart?: string;
      speedEnd?: string;
      angle?: string | null;
      angleStart?: string;
      angleEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();
const speedOrAngleInput = ref<any>(null);

const hint = `Rotation of the whole wheel (i.e. over all wheel slots). Use WheelSlotRotation if only the slot itself (e.g. a Gobo) rotates in this capability. If the fixture doesn't have a physical color wheel, use Effect with ColorFade/ColorJump preset instead.`;

const defaultData = {
  speedOrAngle: 'speed',
  speed: null,
  speedStart: 'slow CW',
  speedEnd: 'fast CW',
  angle: null,
  angleStart: '0deg',
  angleEnd: '360deg',
  comment: '',
};

const resetProperties = computed(() => {
  const resetProperty = props.capability.typeData.speedOrAngle === 'speed' ? 'angle' : 'speed';
  return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
});

async function changeSpeedOrAngle(newValue: string) {
  props.capability.typeData.speedOrAngle = newValue;

  await nextTick();
  if (speedOrAngleInput.value) {
    speedOrAngleInput.value.focus();
  }
}
</script>
