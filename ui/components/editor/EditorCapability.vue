<template>
  <ConditionalDetails :open="capability.open" class="capability">
    <template #summary>
      DMX range
      <code :class="{ 'unset': start === null }">{{ start !== null ? start : min }}</code> …
      <code :class="{ 'unset': end === null }">{{ end !== null ? end : max }}</code>:
      <span :class="{ 'unset': capability.type === `` }">{{ capability.type || 'Unset' }}</span>
    </template>

    <div class="capability-content">

      <LabeledInput
        :formstate="formstate"
        multiple-inputs
        :name="`capability${capability.uuid}-dmxRange`"
        label="DMX range">

        <PropertyInputRange
          ref="firstInput"
          v-model="capability.dmxRange"
          :formstate="formstate"
          :name="`capability${capability.uuid}-dmxRange`"
          :schema-property="capabilityDmxRange"
          :range-min="min"
          :range-max="max"
          :start-hint="capabilities.length === 1 ? `${min}` : `start`"
          :end-hint="capabilities.length === 1 ? `${max}` : `end`"
          :required="capabilities.length > 1"
          @start-updated="onStartUpdated()"
          @end-updated="onEndUpdated()" />

      </LabeledInput>

      <button
        v-if="isChanged"
        type="button"
        class="close icon-button"
        title="Remove capability"
        @click.prevent="clear()">
        <OflSvg name="close" />
      </button>

      <EditorCapabilityTypeData
        ref="capabilityTypeData"
        :capability="capability"
        :channel="channel"
        :formstate="formstate"
        required />

    </div>
  </ConditionalDetails>
</template>

<style lang="scss" scoped>
.capability {
  position: relative;
  margin: 0 -0.5rem;

  &:not(:last-child) {
    border-bottom: 1px solid theme-color(divider);
  }

  &[open] {
    padding-bottom: 1.5rem;
    margin-bottom: 0.8rem;
  }

  & ::v-deep summary {
    padding: 0.3rem 0.5rem;
  }
}

.capability-content {
  padding: 0 1.5rem;
}

.unset {
  color: theme-color(text-disabled);
}

.icon-button.close {
  position: absolute;
  top: 0;
  right: 0;
}
</style>

<script>
import { numberProp, objectProp } from 'vue-ts-types';
import { capabilityDmxRange } from '../../../lib/schema-properties.js';
import { getEmptyCapability, isCapabilityChanged } from '../../assets/scripts/editor-utils.js';

import ConditionalDetails from '../ConditionalDetails.vue';
import LabeledInput from '../LabeledInput.vue';
import PropertyInputRange from '../PropertyInputRange.vue';
import EditorCapabilityTypeData from './EditorCapabilityTypeData.vue';

export default {
  components: {
    ConditionalDetails,
    EditorCapabilityTypeData,
    LabeledInput,
    PropertyInputRange,
  },
  props: {
    channel: objectProp().required,
    capabilityIndex: numberProp().required,
    resolution: numberProp().required,
    formstate: objectProp().required,
  },
  emits: {
    'insert-capability-before': () => true,
    'insert-capability-after': () => true,
  },
  data() {
    return {
      dmxMin: 0,
      capabilityDmxRange,
    };
  },
  computed: {
    capabilities() {
      return this.channel.capabilities;
    },
    capability() {
      return this.capabilities[this.capabilityIndex];
    },
    dmxMax() {
      return Math.pow(256, this.resolution) - 1;
    },
    isChanged() {
      return this.capabilities.some(
        capability => isCapabilityChanged(capability),
      );
    },
    start() {
      return this.capability.dmxRange === null ? null : this.capability.dmxRange[0];
    },
    end() {
      return this.capability.dmxRange === null ? null : this.capability.dmxRange[1];
    },
    min() {
      let min = this.dmxMin;
      let index = this.capabilityIndex - 1;
      while (index >= 0) {
        const capability = this.capabilities[index];
        if (capability.dmxRange !== null) {
          if (capability.dmxRange[1]) {
            min = capability.dmxRange[1] + 1;
            break;
          }
          if (capability.dmxRange[0] !== null) {
            min = capability.dmxRange[0] + 1;
            break;
          }
        }
        index--;
      }
      return min;
    },
    max() {
      let max = this.dmxMax;
      let index = this.capabilityIndex + 1;
      while (index < this.capabilities.length) {
        const capability = this.capabilities[index];
        if (capability.dmxRange !== null) {
          if (capability.dmxRange[0] !== null) {
            max = capability.dmxRange[0] - 1;
            break;
          }
          if (capability.dmxRange[1] !== null) {
            max = capability.dmxRange[1] - 1;
            break;
          }
        }
        index++;
      }
      return max;
    },
  },
  methods: {
    onStartUpdated() {
      if (this.start === null) {
        const previousCapability = this.capabilities[this.capabilityIndex - 1];
        if (previousCapability && !isCapabilityChanged(previousCapability)) {
          this.removePreviousCapability();
        }
        return;
      }

      const previousCapability = this.capabilities[this.capabilityIndex - 1];
      if (previousCapability) {
        if (isCapabilityChanged(previousCapability)) {
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
    onEndUpdated() {
      if (this.end === null) {
        const nextCapability = this.capabilities[this.capabilityIndex + 1];
        if (nextCapability && !isCapabilityChanged(nextCapability)) {
          this.removeNextCapability();
        }
        return;
      }

      const nextCapability = this.capabilities[this.capabilityIndex + 1];
      if (nextCapability) {
        if (isCapabilityChanged(nextCapability)) {
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
      const emptyCapability = getEmptyCapability();
      for (const property of Object.keys(emptyCapability)) {
        this.capability[property] = emptyCapability[property];
      }
      this.collapseWithNeighbors();
    },
    collapseWithNeighbors() {
      const previousCapability = this.capabilities[this.capabilityIndex - 1];
      const nextCapability = this.capabilities[this.capabilityIndex + 1];

      if (previousCapability && !isCapabilityChanged(previousCapability)) {
        if (nextCapability && !isCapabilityChanged(nextCapability)) {
          this.removePreviousCapability();
          this.removeCurrentCapability();
          return;
        }

        this.removePreviousCapability();
        return;
      }

      if (nextCapability && !isCapabilityChanged(nextCapability)) {
        this.removeNextCapability();
      }
    },
    async insertCapabilityBefore() {
      this.$emit(`insert-capability-before`);

      const dialog = this.$el.closest(`.dialog`);
      await this.$nextTick();

      const newCapability = dialog.querySelector(`.capability-editor`).children[this.capabilityIndex - 1];
      dialog.scrollTop += newCapability.clientHeight;
    },
    insertCapabilityAfter() {
      this.$emit(`insert-capability-after`);
    },
    removePreviousCapability() {
      this.$delete(this.capabilities, this.capabilityIndex - 1);
    },
    removeCurrentCapability() {
      this.$delete(this.capabilities, this.capabilityIndex);
    },
    removeNextCapability() {
      this.$delete(this.capabilities, this.capabilityIndex + 1);
    },

    /** @public */
    cleanCapabilityData() {
      if (this.capability.dmxRange === null) {
        this.capability.dmxRange = [null, null];
      }
      if (this.capability.dmxRange[0] === null) {
        this.capability.dmxRange[0] = this.min;
      }
      if (this.capability.dmxRange[1] === null) {
        this.capability.dmxRange[1] = this.max;
      }

      this.$refs.capabilityTypeData.cleanCapabilityData();
    },

    /** @public */
    focus() {
      this.$refs.firstInput.focus();
    },
  },
};
</script>
