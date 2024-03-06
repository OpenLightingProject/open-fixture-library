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
          v-for="type of capabilityTypes"
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

<script>
import { booleanProp, objectProp } from 'vue-ts-types';
import { capabilityTypes } from '../../../lib/schema-properties.js';

import LabeledInput from '../LabeledInput.vue';

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

export default {
  components: {
    LabeledInput,
    CapabilityNoFunction,
    CapabilityShutterStrobe,
    CapabilityStrobeSpeed,
    CapabilityStrobeDuration,
    CapabilityIntensity,
    CapabilityColorIntensity,
    CapabilityColorPreset,
    CapabilityColorTemperature,
    CapabilityPan,
    CapabilityPanContinuous,
    CapabilityTilt,
    CapabilityTiltContinuous,
    CapabilityPanTiltSpeed,
    CapabilityWheelSlot,
    CapabilityWheelShake,
    CapabilityWheelSlotRotation,
    CapabilityWheelRotation,
    CapabilityEffect,
    CapabilityEffectSpeed,
    CapabilityEffectDuration,
    CapabilityEffectParameter,
    CapabilitySoundSensitivity,
    CapabilityBeamAngle,
    CapabilityBeamPosition,
    CapabilityFocus,
    CapabilityZoom,
    CapabilityIris,
    CapabilityIrisEffect,
    CapabilityFrost,
    CapabilityFrostEffect,
    CapabilityPrism,
    CapabilityPrismRotation,
    CapabilityBladeInsertion,
    CapabilityBladeRotation,
    CapabilityBladeSystemRotation,
    CapabilityFog,
    CapabilityFogOutput,
    CapabilityFogType,
    CapabilityRotation,
    CapabilitySpeed,
    CapabilityTime,
    CapabilityMaintenance,
    CapabilityGeneric,
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
    formstate: objectProp().optional,
    required: booleanProp().withDefault(false),
  },
  data() {
    return {
      capabilityTypes: Object.keys(capabilityTypes),
      capabilityTypeHint: null,
    };
  },
  watch: {
    'capability.type': async function() {
      // Add all properties to capability.typeData that are required by the current capability type and are not yet in there.

      await this.$nextTick();

      const defaultData = this.$refs.capabilityTypeData.defaultData;
      for (const property of Object.keys(defaultData)) {
        if (!(property in this.capability.typeData)) {
          this.$set(this.capability.typeData, property, defaultData[property]);
        }
      }

      this.capabilityTypeHint = `hint` in this.$refs.capabilityTypeData
        ? this.$refs.capabilityTypeData.hint
        : null;
    },
  },
  methods: {
    /**
     * Called when the channel is saved. Removes all properties from capability.typeData that are not relevant for this capability type and sets open to false.
     * @public
     */
    cleanCapabilityData() {
      const component = this.$refs.capabilityTypeData;

      const defaultData = component.defaultData;

      for (const property of Object.keys(this.capability.typeData)) {
        if (!(property in defaultData)) {
          delete this.capability.typeData[property];
        }
      }

      if (component && `resetProperties` in component) {
        const resetProperties = component.resetProperties;

        for (const property of resetProperties) {
          const defaultPropertyData = defaultData[property];
          this.capability.typeData[property] = typeof defaultPropertyData === `string` ? `` : defaultPropertyData;
        }
      }

      this.capability.open = false;
    },
  },
};
</script>
