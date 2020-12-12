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
        :multiple-inputs="true"
        :name="`capability${capability.uuid}-dmxRange`"
        label="DMX range">

        <PropertyInputRange
          ref="firstInput"
          v-model="capability.dmxRange"
          :formstate="formstate"
          :name="`capability${capability.uuid}-dmxRange`"
          :schema-property="properties.capability.dmxRange"
          :range-min="min"
          :range-max="max"
          :start-hint="capabilities.length === 1 ? `${min}` : `start`"
          :end-hint="capabilities.length === 1 ? `${max}` : `end`"
          :required="capabilities.length > 1"
          @start-updated="onStartUpdated()"
          @end-updated="onEndUpdated()" />

      </LabeledInput>

      <a
        v-if="isChanged"
        href="#remove"
        class="remove"
        title="Remove capability"
        @click.prevent="clear()">
        <OflSvg name="close" />
      </a>

      <EditorCapabilityTypeData
        ref="capabilityTypeData"
        v-model="capability"
        :channel="channel"
        :formstate="formstate"
        required />

    </div>
  </ConditionalDetails>
</template>

<style lang="scss" scoped>
.capability {
  margin: 0 -0.5rem;
  position: relative;

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

a.remove {
  display: inline-block;
  position: absolute;
  right: 0;
  top: 0;
  padding: 0.3rem;
  width: 1.4rem;
  height: 1.4rem;
  vertical-align: middle;

  & > .icon {
    vertical-align: unset;
  }
}
</style>

<script>
import schemaProperties from '../../../lib/schema-properties.js';
import {
  getEmptyCapability,
  isCapabilityChanged,
} from '../../assets/scripts/editor-utils.js';

import ConditionalDetails from '../ConditionalDetails.vue';
import EditorCapabilityTypeData from './EditorCapabilityTypeData.vue';
import LabeledInput from '../LabeledInput.vue';
import PropertyInputRange from '../PropertyInputRange.vue';

export default {
  components: {
    ConditionalDetails,
    EditorCapabilityTypeData,
    LabeledInput,
    PropertyInputRange,
  },
  props: {
    channel: {
      type: Object,
      required: true,
    },
    capabilityIndex: {
      type: Number,
      required: true,
    },
    resolution: {
      type: Number,
      required: true,
    },
    formstate: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dmxMin: 0,
      properties: schemaProperties,
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
      return this.capability.dmxRange !== null ? this.capability.dmxRange[0] : null;
    },
    end() {
      return this.capability.dmxRange !== null ? this.capability.dmxRange[1] : null;
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
    // eslint-disable-next-line complexity
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
    // eslint-disable-next-line complexity
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
    insertCapabilityBefore() {
      this.$emit(`insert-capability-before`);

      const dialog = this.$el.closest(`dialog`);
      this.$nextTick(() => {
        const newCapability = dialog.querySelector(`.capability-editor`).children[this.capabilityIndex - 1];
        dialog.scrollTop += newCapability.clientHeight;
      });
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
    cleanCapabilityData() { // eslint-disable-line vue/no-unused-properties
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
  },
};
</script>
