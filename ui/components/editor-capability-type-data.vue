<template>
  <div class="editor-capability-type-data">
    <app-labeled-input
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
    </app-labeled-input>

    <component
      v-if="capability.type !== ``"
      ref="capabilityTypeData"
      :is="`app-editor-capability-${capability.type}`"
      :capability="capability"
      :formstate="formstate" />
  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import labeledInputVue from '~/components/labeled-input.vue';

import editorCapabilityNoFunction from '~/components/editor-capabilities/NoFunction.vue';
import editorCapabilityShutterStrobe from '~/components/editor-capabilities/ShutterStrobe.vue';
import editorCapabilityStrobeSpeed from '~/components/editor-capabilities/StrobeSpeed.vue';
import editorCapabilityStrobeDuration from '~/components/editor-capabilities/StrobeDuration.vue';
import editorCapabilityIntensity from '~/components/editor-capabilities/Intensity.vue';
import editorCapabilityColorIntensity from '~/components/editor-capabilities/ColorIntensity.vue';
import editorCapabilityColorPreset from '~/components/editor-capabilities/ColorPreset.vue';
import editorCapabilityColorWheelIndex from '~/components/editor-capabilities/ColorWheelIndex.vue';
import editorCapabilityColorWheelRotation from '~/components/editor-capabilities/ColorWheelRotation.vue';
import editorCapabilityColorTemperature from '~/components/editor-capabilities/ColorTemperature.vue';
import editorCapabilityPan from '~/components/editor-capabilities/Pan.vue';
import editorCapabilityPanContinuous from '~/components/editor-capabilities/PanContinuous.vue';
import editorCapabilityTilt from '~/components/editor-capabilities/Tilt.vue';
import editorCapabilityTiltContinuous from '~/components/editor-capabilities/TiltContinuous.vue';
import editorCapabilityPanTiltSpeed from '~/components/editor-capabilities/PanTiltSpeed.vue';
import editorCapabilityEffect from '~/components/editor-capabilities/Effect.vue';
import editorCapabilityEffectSpeed from '~/components/editor-capabilities/EffectSpeed.vue';
import editorCapabilityEffectDuration from '~/components/editor-capabilities/EffectDuration.vue';
import editorCapabilityEffectParameter from '~/components/editor-capabilities/EffectParameter.vue';
import editorCapabilitySoundSensitivity from '~/components/editor-capabilities/SoundSensitivity.vue';
import editorCapabilityGoboIndex from '~/components/editor-capabilities/GoboIndex.vue';
import editorCapabilityGoboShake from '~/components/editor-capabilities/GoboShake.vue';
import editorCapabilityGoboStencilRotation from '~/components/editor-capabilities/GoboStencilRotation.vue';
import editorCapabilityGoboWheelRotation from '~/components/editor-capabilities/GoboWheelRotation.vue';
import editorCapabilityFocus from '~/components/editor-capabilities/Focus.vue';
import editorCapabilityZoom from '~/components/editor-capabilities/Zoom.vue';
import editorCapabilityIris from '~/components/editor-capabilities/Iris.vue';
import editorCapabilityIrisEffect from '~/components/editor-capabilities/IrisEffect.vue';
import editorCapabilityFrost from '~/components/editor-capabilities/Frost.vue';
import editorCapabilityFrostEffect from '~/components/editor-capabilities/FrostEffect.vue';
import editorCapabilityPrism from '~/components/editor-capabilities/Prism.vue';
import editorCapabilityPrismRotation from '~/components/editor-capabilities/PrismRotation.vue';
import editorCapabilityBladeInsertion from '~/components/editor-capabilities/BladeInsertion.vue';
import editorCapabilityBladeRotation from '~/components/editor-capabilities/BladeRotation.vue';
import editorCapabilityBladeSystemRotation from '~/components/editor-capabilities/BladeSystemRotation.vue';
import editorCapabilityFog from '~/components/editor-capabilities/Fog.vue';
import editorCapabilityFogOutput from '~/components/editor-capabilities/FogOutput.vue';
import editorCapabilityFogType from '~/components/editor-capabilities/FogType.vue';
import editorCapabilityBeamAngle from '~/components/editor-capabilities/BeamAngle.vue';
import editorCapabilityRotation from '~/components/editor-capabilities/Rotation.vue';
import editorCapabilitySpeed from '~/components/editor-capabilities/Speed.vue';
import editorCapabilityTime from '~/components/editor-capabilities/Time.vue';
import editorCapabilityMaintenance from '~/components/editor-capabilities/Maintenance.vue';
import editorCapabilityGeneric from '~/components/editor-capabilities/Generic.vue';

export default {
  components: {
    'app-labeled-input': labeledInputVue,
    'app-editor-capability-NoFunction': editorCapabilityNoFunction,
    'app-editor-capability-ShutterStrobe': editorCapabilityShutterStrobe,
    'app-editor-capability-StrobeSpeed': editorCapabilityStrobeSpeed,
    'app-editor-capability-StrobeDuration': editorCapabilityStrobeDuration,
    'app-editor-capability-Intensity': editorCapabilityIntensity,
    'app-editor-capability-ColorIntensity': editorCapabilityColorIntensity,
    'app-editor-capability-ColorPreset': editorCapabilityColorPreset,
    'app-editor-capability-ColorWheelIndex': editorCapabilityColorWheelIndex,
    'app-editor-capability-ColorWheelRotation': editorCapabilityColorWheelRotation,
    'app-editor-capability-ColorTemperature': editorCapabilityColorTemperature,
    'app-editor-capability-Pan': editorCapabilityPan,
    'app-editor-capability-PanContinuous': editorCapabilityPanContinuous,
    'app-editor-capability-Tilt': editorCapabilityTilt,
    'app-editor-capability-TiltContinuous': editorCapabilityTiltContinuous,
    'app-editor-capability-PanTiltSpeed': editorCapabilityPanTiltSpeed,
    'app-editor-capability-Effect': editorCapabilityEffect,
    'app-editor-capability-EffectSpeed': editorCapabilityEffectSpeed,
    'app-editor-capability-EffectDuration': editorCapabilityEffectDuration,
    'app-editor-capability-EffectParameter': editorCapabilityEffectParameter,
    'app-editor-capability-SoundSensitivity': editorCapabilitySoundSensitivity,
    'app-editor-capability-GoboIndex': editorCapabilityGoboIndex,
    'app-editor-capability-GoboShake': editorCapabilityGoboShake,
    'app-editor-capability-GoboStencilRotation': editorCapabilityGoboStencilRotation,
    'app-editor-capability-GoboWheelRotation': editorCapabilityGoboWheelRotation,
    'app-editor-capability-Focus': editorCapabilityFocus,
    'app-editor-capability-Zoom': editorCapabilityZoom,
    'app-editor-capability-Iris': editorCapabilityIris,
    'app-editor-capability-IrisEffect': editorCapabilityIrisEffect,
    'app-editor-capability-Frost': editorCapabilityFrost,
    'app-editor-capability-FrostEffect': editorCapabilityFrostEffect,
    'app-editor-capability-Prism': editorCapabilityPrism,
    'app-editor-capability-PrismRotation': editorCapabilityPrismRotation,
    'app-editor-capability-BladeInsertion': editorCapabilityBladeInsertion,
    'app-editor-capability-BladeRotation': editorCapabilityBladeRotation,
    'app-editor-capability-BladeSystemRotation': editorCapabilityBladeSystemRotation,
    'app-editor-capability-Fog': editorCapabilityFog,
    'app-editor-capability-FogOutput': editorCapabilityFogOutput,
    'app-editor-capability-FogType': editorCapabilityFogType,
    'app-editor-capability-BeamAngle': editorCapabilityBeamAngle,
    'app-editor-capability-Rotation': editorCapabilityRotation,
    'app-editor-capability-Speed': editorCapabilitySpeed,
    'app-editor-capability-Time': editorCapabilityTime,
    'app-editor-capability-Maintenance': editorCapabilityMaintenance,
    'app-editor-capability-Generic': editorCapabilityGeneric
  },
  model: {
    prop: `capability`
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
