<template>
  <app-conditional-details :open="capability.open" class="capability">
    <template slot="summary">
      DMX range
      <code :class="{ 'unset': start === null }">{{ start !== null ? start : min }}</code> …
      <code :class="{ 'unset': end === null }">{{ end !== null ? end : max }}</code>:
      <span :class="{ 'unset': capability.type === `` }">{{ capability.type || 'Unset' }}</span>
    </template>

    <div class="capability-content">

      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-dmxRange`"
        class="range-label"
        label="DMX range">

        <app-property-input-range
          v-model="capability.dmxRange"
          :formstate="formstate"
          :name="`capability${capability.uuid}-dmxRange`"
          :schema-property="properties.capability.dmxRange"
          :range-min="min"
          :range-max="max"
          required
          @start-updated="onStartUpdated"
          @end-updated="onEndUpdated" />

        <a
          v-if="isChanged"
          href="#remove"
          class="remove"
          title="Remove capability"
          @click.prevent="clear">
          <app-svg name="close" />
        </a>

      </app-simple-label>

      <app-simple-label :formstate="formstate" :name="`capability${capability.uuid}-type`" label="Capability type">
        <select
          v-model="capability.type"
          :class="{ empty: capability.type === `` }"
          :name="`capability${capability.uuid}-type`"
          required
          @change="changeCapabilityType">

          <option value="" disabled>Please select a capability type</option>

          <option
            v-for="type in capabilityTypes"
            :key="type"
            :value="type">{{ type }}</option>

        </select>
      </app-simple-label>

      <component
        v-if="capability.type !== ``"
        ref="capabilityTypeData"
        :is="`app-editor-capability-${capability.type}`"
        :capability="capability"
        :formstate="formstate" />

    </div>
  </app-conditional-details>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.capability {
  margin: 0 -0.5rem;

  &:not(:last-child) {
    border-bottom: 1px solid $divider-dark;
  }

  &[open] {
    padding-bottom: 1.5rem;
    margin-bottom: 0.8rem;
  }
}

.capability-content {
  padding: 0 1.5rem;
}

.unset {
  color: $disabled-text-dark;
}

.range-label {
  position: relative;
}

a.remove {
  display: inline-block;
  position: absolute;
  right: 0;
  padding: 0.3rem;
  width: 1.4rem;
  height: 1.4rem;
  vertical-align: middle;

  & > .icon {
    vertical-align: unset;
  }
}
</style>

<style lang="scss">
.capability summary {
  padding: 0.3rem 0.5rem;
}
</style>


<script>
import schemaProperties from '~~/lib/schema-properties.js';
import {
  getEmptyCapability,
  isCapabilityChanged,
  clone
} from '~/assets/scripts/editor-utils.mjs';

import conditionalDetailsVue from '~/components/conditional-details.vue';
import propertyInputRangeVue from '~/components/property-input-range.vue';
import simpleLabelVue from '~/components/simple-label.vue';
import svgVue from "~/components/svg.vue";

import editorCapabilityNothing from '~/components/editor-capabilities/Nothing.vue';
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
import editorCapabilityEffectIntensity from '~/components/editor-capabilities/EffectIntensity.vue';
import editorCapabilityEffectSpeed from '~/components/editor-capabilities/EffectSpeed.vue';
import editorCapabilityEffectDuration from '~/components/editor-capabilities/EffectDuration.vue';
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
import editorCapabilityPrismOff from '~/components/editor-capabilities/PrismOff.vue';
import editorCapabilityPrismOn from '~/components/editor-capabilities/PrismOn.vue';
import editorCapabilityPrismRotation from '~/components/editor-capabilities/PrismRotation.vue';
import editorCapabilityBladeInsertion from '~/components/editor-capabilities/BladeInsertion.vue';
import editorCapabilityBladeRotation from '~/components/editor-capabilities/BladeRotation.vue';
import editorCapabilityBladeSystemRotation from '~/components/editor-capabilities/BladeSystemRotation.vue';
import editorCapabilityFogOff from '~/components/editor-capabilities/FogOff.vue';
import editorCapabilityFogOn from '~/components/editor-capabilities/FogOn.vue';
import editorCapabilityFogOutput from '~/components/editor-capabilities/FogOutput.vue';
import editorCapabilityFogType from '~/components/editor-capabilities/FogType.vue';
import editorCapabilityRotation from '~/components/editor-capabilities/Rotation.vue';
import editorCapabilityBeamAngle from '~/components/editor-capabilities/BeamAngle.vue';
import editorCapabilitySpeed from '~/components/editor-capabilities/Speed.vue';
import editorCapabilityTime from '~/components/editor-capabilities/Time.vue';
import editorCapabilityMaintenance from '~/components/editor-capabilities/Maintenance.vue';
import editorCapabilityGeneric from '~/components/editor-capabilities/Generic.vue';

export default {
  components: {
    'app-conditional-details': conditionalDetailsVue,
    'app-property-input-range': propertyInputRangeVue,
    'app-simple-label': simpleLabelVue,
    'app-svg': svgVue,
    'app-editor-capability-Nothing': editorCapabilityNothing,
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
    'app-editor-capability-EffectIntensity': editorCapabilityEffectIntensity,
    'app-editor-capability-EffectSpeed': editorCapabilityEffectSpeed,
    'app-editor-capability-EffectDuration': editorCapabilityEffectDuration,
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
    'app-editor-capability-PrismOff': editorCapabilityPrismOff,
    'app-editor-capability-PrismOn': editorCapabilityPrismOn,
    'app-editor-capability-PrismRotation': editorCapabilityPrismRotation,
    'app-editor-capability-BladeInsertion': editorCapabilityBladeInsertion,
    'app-editor-capability-BladeRotation': editorCapabilityBladeRotation,
    'app-editor-capability-BladeSystemRotation': editorCapabilityBladeSystemRotation,
    'app-editor-capability-FogOff': editorCapabilityFogOff,
    'app-editor-capability-FogOn': editorCapabilityFogOn,
    'app-editor-capability-FogOutput': editorCapabilityFogOutput,
    'app-editor-capability-FogType': editorCapabilityFogType,
    'app-editor-capability-Rotation': editorCapabilityRotation,
    'app-editor-capability-BeamAngle': editorCapabilityBeamAngle,
    'app-editor-capability-Speed': editorCapabilitySpeed,
    'app-editor-capability-Time': editorCapabilityTime,
    'app-editor-capability-Maintenance': editorCapabilityMaintenance,
    'app-editor-capability-Generic': editorCapabilityGeneric
  },
  model: {
    prop: `capabilities`
  },
  props: {
    capabilities: {
      type: Array,
      required: true
    },
    capIndex: {
      type: Number,
      required: true
    },
    fineness: {
      type: Number,
      required: true
    },
    formstate: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dmxMin: 0,
      properties: schemaProperties
    };
  },
  computed: {
    capability() {
      return this.capabilities[this.capIndex];
    },
    dmxMax() {
      return Math.pow(256, this.fineness + 1) - 1;
    },
    isChanged() {
      return this.capabilities.some(isCapabilityChanged);
    },
    start() {
      return this.capability.dmxRange !== null ? this.capability.dmxRange[0] : null;
    },
    end() {
      return this.capability.dmxRange !== null ? this.capability.dmxRange[1] : null;
    },
    min() {
      let min = this.dmxMin;
      let index = this.capIndex - 1;
      while (index >= 0) {
        const cap = this.capabilities[index];
        if (cap.dmxRange !== null) {
          if (cap.dmxRange[1]) {
            min = cap.dmxRange[1] + 1;
            break;
          }
          if (cap.dmxRange[0] !== null) {
            min = cap.dmxRange[0] + 1;
            break;
          }
        }
        index--;
      }
      return min;
    },
    max() {
      let max = this.dmxMax;
      let index = this.capIndex + 1;
      while (index < this.capabilities.length) {
        const cap = this.capabilities[index];
        if (cap.dmxRange !== null) {
          if (cap.dmxRange[0] !== null) {
            max = cap.dmxRange[0] - 1;
            break;
          }
          if (cap.dmxRange[1] !== null) {
            max = cap.dmxRange[1] - 1;
            break;
          }
        }
        index++;
      }
      return max;
    },
    capabilityTypes() {
      return this.properties.capability.type.enum;
    },
    fieldState() {
      const fieldNames = Object.keys(this.formstate).filter(
        fieldName => fieldName.startsWith(`capability${this.capability.uuid}-`)
      );

      for (const fieldName of fieldNames) {
        if (this.formstate.$error[fieldName]) {
          return this.formstate[fieldName];
        }
      }

      return {};
    },
    fieldErrors() {
      if (!(`$valid` in this.fieldState) || this.fieldState.$valid) {
        return {};
      }

      return this.fieldState.$error;
    }
  },
  methods: {
    // eslint-disable-next-line complexity
    onStartUpdated() {
      if (this.start === null) {
        const prevCap = this.capabilities[this.capIndex - 1];
        if (prevCap && !isCapabilityChanged(prevCap)) {
          this.removePreviousCapability();
        }
        return;
      }

      const prevCap = this.capabilities[this.capIndex - 1];
      if (prevCap) {
        if (isCapabilityChanged(prevCap)) {
          if (this.start > this.min) {
            this.insertCapabilityBefore();
          }
          return;
        }

        if (this.start <= this.min) {
          this.removePreviousCapability();
        }
        return;
      }

      if (this.start > this.dmxMin) {
        this.insertCapabilityBefore();
      }
    },
    // eslint-disable-next-line complexity
    onEndUpdated() {
      if (this.end === null) {
        const nextCap = this.capabilities[this.capIndex + 1];
        if (nextCap && !isCapabilityChanged(nextCap)) {
          this.removeNextCapability();
        }
        return;
      }

      const nextCap = this.capabilities[this.capIndex + 1];
      if (nextCap) {
        if (isCapabilityChanged(nextCap)) {
          if (this.end < this.max) {
            this.insertCapabilityAfter();
          }
          return;
        }

        if (this.end >= this.max) {
          this.removeNextCapability();
        }
        return;
      }

      if (this.end < this.dmxMax) {
        this.insertCapabilityAfter();
      }
    },
    clear() {
      const emptyCap = getEmptyCapability();
      for (const prop of Object.keys(emptyCap)) {
        this.capability[prop] = emptyCap[prop];
      }
      this.collapseWithNeighbors();
    },
    collapseWithNeighbors() {
      const prevCap = this.capabilities[this.capIndex - 1];
      const nextCap = this.capabilities[this.capIndex + 1];

      if (prevCap && !isCapabilityChanged(prevCap)) {
        if (nextCap && !isCapabilityChanged(nextCap)) {
          this.removePreviousCapability();
          this.removeCurrentCapability();
          return;
        }

        this.removePreviousCapability();
        return;
      }

      if (nextCap && !isCapabilityChanged(nextCap)) {
        this.removeNextCapability();
      }
    },
    insertCapabilityBefore() {
      this.spliceCapabilities(this.capIndex, 0, getEmptyCapability());

      const dialog = this.$el.closest(`dialog`);
      this.$nextTick(() => {
        const newCapability = dialog.querySelector(`.capability-editor`).children[this.capIndex - 1];
        dialog.scrollTop += newCapability.clientHeight;
      });
    },
    insertCapabilityAfter() {
      this.spliceCapabilities(this.capIndex + 1, 0, getEmptyCapability());
    },
    removePreviousCapability() {
      this.spliceCapabilities(this.capIndex - 1, 1);
    },
    removeCurrentCapability() {
      this.spliceCapabilities(this.capIndex, 1);
    },
    removeNextCapability() {
      this.spliceCapabilities(this.capIndex + 1, 1);
    },
    spliceCapabilities(index, deleteCount, ...insertItems) {
      // immutable splice, see https://vincent.billey.me/pure-javascript-immutable-array/
      const capabilities = clone(this.capabilities);
      const newCapabilities = [...capabilities.slice(0, index), ...insertItems, ...capabilities.slice(index + deleteCount)];
      this.$emit(`input`, newCapabilities);
    },

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
      });
    },

    /**
     * Called when the channel is saved. Removes all properties from capability.typeData that are not relevant for this capability type and sets open to false.
     */
    cleanCapabilityData() {
      const defaultData = this.$refs.capabilityTypeData.defaultData;

      for (const prop of Object.keys(this.capability.typeData)) {
        if (!(prop in defaultData)) {
          delete this.capability.typeData[prop];
        }
      }

      if (this.$refs.capabilityTypeData && `cleanCapabilityData` in this.$refs.capabilityTypeData) {
        this.$refs.capabilityTypeData.cleanCapabilityData();
      }

      this.capability.open = false;
    }
  }
};
</script>
