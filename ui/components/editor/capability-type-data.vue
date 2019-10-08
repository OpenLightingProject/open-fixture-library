<template>
  <div class="editor-capability-type-data">
    <labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-type`"
      :hint="capabilityTypeHint"
      label="Capability type">
      <select
        v-model="capability.type"
        :class="{ empty: capability.type === `` }"
        :name="`capability${capability.uuid}-type`"
        :required="required"
        @change="changeCapabilityType">

        <option value="" disabled>Please select a capability type</option>

        <option
          v-for="type in capabilityTypes"
          :key="type"
          :value="type">{{ type }}</option>

      </select>
    </labeled-input>

    <component
      :is="`app-editor-capability-${capability.type}`"
      v-if="capability.type !== ``"
      ref="capabilityTypeData"
      :capability="capability"
      :channel="channel"
      :formstate="formstate" />
  </div>
</template>

<script>
import schemaProperties from '../../../lib/schema-properties.js';

import labeledInput from '../labeled-input.vue';

import editorCapabilityNoFunction from './capabilities/NoFunction.vue';
import editorCapabilityShutterStrobe from './capabilities/ShutterStrobe.vue';
import editorCapabilityStrobeSpeed from './capabilities/StrobeSpeed.vue';
import editorCapabilityStrobeDuration from './capabilities/StrobeDuration.vue';
import editorCapabilityIntensity from './capabilities/Intensity.vue';
import editorCapabilityColorIntensity from './capabilities/ColorIntensity.vue';
import editorCapabilityColorPreset from './capabilities/ColorPreset.vue';
import editorCapabilityColorTemperature from './capabilities/ColorTemperature.vue';
import editorCapabilityPan from './capabilities/Pan.vue';
import editorCapabilityPanContinuous from './capabilities/PanContinuous.vue';
import editorCapabilityTilt from './capabilities/Tilt.vue';
import editorCapabilityTiltContinuous from './capabilities/TiltContinuous.vue';
import editorCapabilityPanTiltSpeed from './capabilities/PanTiltSpeed.vue';
import editorCapabilityWheelSlot from './capabilities/WheelSlot.vue';
import editorCapabilityWheelShake from './capabilities/WheelShake.vue';
import editorCapabilityWheelSlotRotation from './capabilities/WheelSlotRotation.vue';
import editorCapabilityWheelRotation from './capabilities/WheelRotation.vue';
import editorCapabilityEffect from './capabilities/Effect.vue';
import editorCapabilityEffectSpeed from './capabilities/EffectSpeed.vue';
import editorCapabilityEffectDuration from './capabilities/EffectDuration.vue';
import editorCapabilityEffectParameter from './capabilities/EffectParameter.vue';
import editorCapabilitySoundSensitivity from './capabilities/SoundSensitivity.vue';
import editorCapabilityBeamAngle from './capabilities/BeamAngle.vue';
import editorCapabilityBeamPosition from './capabilities/BeamPosition.vue';
import editorCapabilityFocus from './capabilities/Focus.vue';
import editorCapabilityZoom from './capabilities/Zoom.vue';
import editorCapabilityIris from './capabilities/Iris.vue';
import editorCapabilityIrisEffect from './capabilities/IrisEffect.vue';
import editorCapabilityFrost from './capabilities/Frost.vue';
import editorCapabilityFrostEffect from './capabilities/FrostEffect.vue';
import editorCapabilityPrism from './capabilities/Prism.vue';
import editorCapabilityPrismRotation from './capabilities/PrismRotation.vue';
import editorCapabilityBladeInsertion from './capabilities/BladeInsertion.vue';
import editorCapabilityBladeRotation from './capabilities/BladeRotation.vue';
import editorCapabilityBladeSystemRotation from './capabilities/BladeSystemRotation.vue';
import editorCapabilityFog from './capabilities/Fog.vue';
import editorCapabilityFogOutput from './capabilities/FogOutput.vue';
import editorCapabilityFogType from './capabilities/FogType.vue';
import editorCapabilityRotation from './capabilities/Rotation.vue';
import editorCapabilitySpeed from './capabilities/Speed.vue';
import editorCapabilityTime from './capabilities/Time.vue';
import editorCapabilityMaintenance from './capabilities/Maintenance.vue';
import editorCapabilityGeneric from './capabilities/Generic.vue';

export default {
  components: {
    'labeled-input': labeledInput,
    'editor-capability-NoFunction': editorCapabilityNoFunction,
    'editor-capability-ShutterStrobe': editorCapabilityShutterStrobe,
    'editor-capability-StrobeSpeed': editorCapabilityStrobeSpeed,
    'editor-capability-StrobeDuration': editorCapabilityStrobeDuration,
    'editor-capability-Intensity': editorCapabilityIntensity,
    'editor-capability-ColorIntensity': editorCapabilityColorIntensity,
    'editor-capability-ColorPreset': editorCapabilityColorPreset,
    'editor-capability-ColorTemperature': editorCapabilityColorTemperature,
    'editor-capability-Pan': editorCapabilityPan,
    'editor-capability-PanContinuous': editorCapabilityPanContinuous,
    'editor-capability-Tilt': editorCapabilityTilt,
    'editor-capability-TiltContinuous': editorCapabilityTiltContinuous,
    'editor-capability-PanTiltSpeed': editorCapabilityPanTiltSpeed,
    'editor-capability-WheelSlot': editorCapabilityWheelSlot,
    'editor-capability-WheelShake': editorCapabilityWheelShake,
    'editor-capability-WheelSlotRotation': editorCapabilityWheelSlotRotation,
    'editor-capability-WheelRotation': editorCapabilityWheelRotation,
    'editor-capability-Effect': editorCapabilityEffect,
    'editor-capability-EffectSpeed': editorCapabilityEffectSpeed,
    'editor-capability-EffectDuration': editorCapabilityEffectDuration,
    'editor-capability-EffectParameter': editorCapabilityEffectParameter,
    'editor-capability-SoundSensitivity': editorCapabilitySoundSensitivity,
    'editor-capability-BeamAngle': editorCapabilityBeamAngle,
    'editor-capability-BeamPosition': editorCapabilityBeamPosition,
    'editor-capability-Focus': editorCapabilityFocus,
    'editor-capability-Zoom': editorCapabilityZoom,
    'editor-capability-Iris': editorCapabilityIris,
    'editor-capability-IrisEffect': editorCapabilityIrisEffect,
    'editor-capability-Frost': editorCapabilityFrost,
    'editor-capability-FrostEffect': editorCapabilityFrostEffect,
    'editor-capability-Prism': editorCapabilityPrism,
    'editor-capability-PrismRotation': editorCapabilityPrismRotation,
    'editor-capability-BladeInsertion': editorCapabilityBladeInsertion,
    'editor-capability-BladeRotation': editorCapabilityBladeRotation,
    'editor-capability-BladeSystemRotation': editorCapabilityBladeSystemRotation,
    'editor-capability-Fog': editorCapabilityFog,
    'editor-capability-FogOutput': editorCapabilityFogOutput,
    'editor-capability-FogType': editorCapabilityFogType,
    'editor-capability-Rotation': editorCapabilityRotation,
    'editor-capability-Speed': editorCapabilitySpeed,
    'editor-capability-Time': editorCapabilityTime,
    'editor-capability-Maintenance': editorCapabilityMaintenance,
    'editor-capability-Generic': editorCapabilityGeneric
  },
  model: {
    prop: `capability`
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    channel: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: false,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      properties: schemaProperties,
      capabilityTypeHint: null
    };
  },
  computed: {
    capabilityTypes() {
      return this.properties.capability.type.enum;
    }
  },
  methods: {
    /**
     * Add all properties to capability.typeData that are required by the current capability type and are not yet in there.
     */
    changeCapabilityType() {
      this.$nextTick(() => {
        const defaultData = this.$refs.capabilityTypeData.defaultData;

        for (const prop of Object.keys(defaultData)) {
          if (!(prop in this.capability.typeData)) {
            this.$set(this.capability.typeData, prop, defaultData[prop]);
          }
        }

        if (`hint` in this.$refs.capabilityTypeData) {
          this.capabilityTypeHint = this.$refs.capabilityTypeData.hint;
        }
        else {
          this.capabilityTypeHint = null;
        }
      });
    },

    /**
     * Called when the channel is saved. Removes all properties from capability.typeData that are not relevant for this capability type and sets open to false.
     */
    cleanCapabilityData() {
      const component = this.$refs.capabilityTypeData;

      const defaultData = component.defaultData;

      for (const prop of Object.keys(this.capability.typeData)) {
        if (!(prop in defaultData)) {
          delete this.capability.typeData[prop];
        }
      }

      if (component && `resetProps` in component) {
        const resetProps = component.resetProps;

        for (const prop of resetProps) {
          const defaultPropData = defaultData[prop];
          this.capability.typeData[prop] = typeof defaultPropData === `string` ? `` : defaultPropData;
        }
      }

      this.capability.open = false;
    }
  }
};
</script>
