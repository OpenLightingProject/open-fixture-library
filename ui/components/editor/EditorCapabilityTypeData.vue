<template>
  <div class="editor-capability-type-data">
    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-type`"
      :hint="capabilityTypeHint"
      label="Capability type">
      <select
        v-model="capability.type"
        :class="{ empty: capability.type === `` }"
        :name="`capability${capability.uuid}-type`"
        :required="required">

        <option value="" disabled>Please select a capability type</option>

        <option
          v-for="type of capabilityTypesList"
          :key="type"
          :value="type">{{ type }}</option>

      </select>
    </LabeledInput>

    <Component
      :is="`Capability${capability.type}`"
      v-if="capability.type !== ``"
      ref="capabilityTypeData"
      :capability="capability"
      :channel="channel"
      :formstate="formstate" />
  </div>
</template>

<script setup lang="ts">
import CapabilityBeamAngle from './capabilities/CapabilityBeamAngle.vue';
import CapabilityBeamPosition from './capabilities/CapabilityBeamPosition.vue';
import CapabilityBladeInsertion from './capabilities/CapabilityBladeInsertion.vue';
import CapabilityBladeRotation from './capabilities/CapabilityBladeRotation.vue';
import CapabilityBladeSystemRotation from './capabilities/CapabilityBladeSystemRotation.vue';
import CapabilityColorIntensity from './capabilities/CapabilityColorIntensity.vue';
import CapabilityColorPreset from './capabilities/CapabilityColorPreset.vue';
import CapabilityColorTemperature from './capabilities/CapabilityColorTemperature.vue';
import CapabilityEffect from './capabilities/CapabilityEffect.vue';
import CapabilityEffectDuration from './capabilities/CapabilityEffectDuration.vue';
import CapabilityEffectParameter from './capabilities/CapabilityEffectParameter.vue';
import CapabilityEffectSpeed from './capabilities/CapabilityEffectSpeed.vue';
import CapabilityFocus from './capabilities/CapabilityFocus.vue';
import CapabilityFog from './capabilities/CapabilityFog.vue';
import CapabilityFogOutput from './capabilities/CapabilityFogOutput.vue';
import CapabilityFogType from './capabilities/CapabilityFogType.vue';
import CapabilityFrost from './capabilities/CapabilityFrost.vue';
import CapabilityFrostEffect from './capabilities/CapabilityFrostEffect.vue';
import CapabilityGeneric from './capabilities/CapabilityGeneric.vue';
import CapabilityIntensity from './capabilities/CapabilityIntensity.vue';
import CapabilityIris from './capabilities/CapabilityIris.vue';
import CapabilityIrisEffect from './capabilities/CapabilityIrisEffect.vue';
import CapabilityMaintenance from './capabilities/CapabilityMaintenance.vue';
import CapabilityNoFunction from './capabilities/CapabilityNoFunction.vue';
import CapabilityPan from './capabilities/CapabilityPan.vue';
import CapabilityPanContinuous from './capabilities/CapabilityPanContinuous.vue';
import CapabilityPanTiltSpeed from './capabilities/CapabilityPanTiltSpeed.vue';
import CapabilityPrism from './capabilities/CapabilityPrism.vue';
import CapabilityPrismRotation from './capabilities/CapabilityPrismRotation.vue';
import CapabilityRotation from './capabilities/CapabilityRotation.vue';
import CapabilityShutterStrobe from './capabilities/CapabilityShutterStrobe.vue';
import CapabilitySoundSensitivity from './capabilities/CapabilitySoundSensitivity.vue';
import CapabilitySpeed from './capabilities/CapabilitySpeed.vue';
import CapabilityStrobeDuration from './capabilities/CapabilityStrobeDuration.vue';
import CapabilityStrobeSpeed from './capabilities/CapabilityStrobeSpeed.vue';
import CapabilityTilt from './capabilities/CapabilityTilt.vue';
import CapabilityTiltContinuous from './capabilities/CapabilityTiltContinuous.vue';
import CapabilityTime from './capabilities/CapabilityTime.vue';
import CapabilityWheelRotation from './capabilities/CapabilityWheelRotation.vue';
import CapabilityWheelShake from './capabilities/CapabilityWheelShake.vue';
import CapabilityWheelSlot from './capabilities/CapabilityWheelSlot.vue';
import CapabilityWheelSlotRotation from './capabilities/CapabilityWheelSlotRotation.vue';
import CapabilityZoom from './capabilities/CapabilityZoom.vue';
import { capabilityTypes } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    type: string;
    typeData: Record<string, any>;
  };
  channel: object;
  formstate?: object;
  required?: boolean;
}

const props = defineProps<Props>();

defineOptions({
  components: {
    CapabilityBeamAngle,
    CapabilityBeamPosition,
    CapabilityBladeInsertion,
    CapabilityBladeRotation,
    CapabilityBladeSystemRotation,
    CapabilityColorIntensity,
    CapabilityColorPreset,
    CapabilityColorTemperature,
    CapabilityEffect,
    CapabilityEffectDuration,
    CapabilityEffectParameter,
    CapabilityEffectSpeed,
    CapabilityFocus,
    CapabilityFog,
    CapabilityFogOutput,
    CapabilityFogType,
    CapabilityFrost,
    CapabilityFrostEffect,
    CapabilityGeneric,
    CapabilityIntensity,
    CapabilityIris,
    CapabilityIrisEffect,
    CapabilityMaintenance,
    CapabilityNoFunction,
    CapabilityPan,
    CapabilityPanContinuous,
    CapabilityPanTiltSpeed,
    CapabilityPrism,
    CapabilityPrismRotation,
    CapabilityRotation,
    CapabilityShutterStrobe,
    CapabilitySoundSensitivity,
    CapabilitySpeed,
    CapabilityStrobeDuration,
    CapabilityStrobeSpeed,
    CapabilityTilt,
    CapabilityTiltContinuous,
    CapabilityTime,
    CapabilityWheelRotation,
    CapabilityWheelShake,
    CapabilityWheelSlot,
    CapabilityWheelSlotRotation,
    CapabilityZoom,
  },
});

const capabilityTypeData = ref<any>(null);

const capabilityTypesList = Object.keys(capabilityTypes);
const capabilityTypeHint = ref<string | null>(null);

watch(
  () => props.capability.type,
  async () => {
    await nextTick();

    if (capabilityTypeData.value?.defaultData) {
      const defaultData = capabilityTypeData.value.defaultData;
      for (const [property, value] of Object.entries(defaultData)) {
        if (!(property in props.capability.typeData)) {
          props.capability.typeData[property] = value;
        }
      }
    }

    capabilityTypeHint.value = capabilityTypeData.value?.hint ?? null;
  }
);

function cleanCapabilityData() {
  const component = capabilityTypeData.value;

  if (!component) return;

  const defaultData = component.defaultData;

  for (const property of Object.keys(props.capability.typeData)) {
    if (!(property in defaultData)) {
      delete props.capability.typeData[property];
    }
  }

  if (component?.resetProperties) {
    const resetProperties = component.resetProperties;

    for (const property of resetProperties) {
      const defaultPropertyData = defaultData[property];
      props.capability.typeData[property] = typeof defaultPropertyData === 'string' ? '' : defaultPropertyData;
    }
  }

  props.capability.open = false;
}

defineExpose({ cleanCapabilityData });
</script>
