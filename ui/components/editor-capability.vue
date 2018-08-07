<template>
  <app-conditional-details :open="capability.open" class="capability">
    <template slot="summary">
      DMX range
      <code :class="{ 'unset': start === null }">{{ start !== null ? start : min }}</code> …
      <code :class="{ 'unset': end === null }">{{ end !== null ? end : max }}</code>:
      <span :class="{ 'unset': capability.type === `` }">{{ capability.type || 'Unset' }}</span>
    </template>

    <div class="capability-content">

      <app-labeled-input
        :formstate="formstate"
        :name="`capability${capability.uuid}-dmxRange`"
        label="DMX range">

        <app-property-input-range
          ref="firstInput"
          v-model="capability.dmxRange"
          :formstate="formstate"
          :name="`capability${capability.uuid}-dmxRange`"
          :schema-property="properties.capability.dmxRange"
          :range-min="min"
          :range-max="max"
          :start-hint="capabilities.length === 1 ? `${min}`: `start`"
          :end-hint="capabilities.length === 1 ? `${max}`: `end`"
          :required="capabilities.length > 1"
          @start-updated="onStartUpdated"
          @end-updated="onEndUpdated" />

      </app-labeled-input>

      <a
        v-if="isChanged"
        href="#remove"
        class="remove"
        title="Remove capability"
        @click.prevent="clear">
        <app-svg name="close" />
      </a>

      <app-editor-capability-type-data
        ref="capabilityTypeData"
        v-model="capability"
        :formstate="formstate"
        required />

    </div>
  </app-conditional-details>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.capability {
  margin: 0 -0.5rem;
  position: relative;

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

<style lang="scss">
.capability summary {
  padding: 0.3rem 0.5rem;
}
</style>


<script>
import schemaProperties from '~~/lib/schema-properties.js';
import {
  getEmptyCapability,
  isCapabilityChanged
} from '~/assets/scripts/editor-utils.mjs';

import conditionalDetailsVue from '~/components/conditional-details.vue';
import propertyInputRangeVue from '~/components/property-input-range.vue';
import labeledInputVue from '~/components/labeled-input.vue';
import svgVue from "~/components/svg.vue";

import editorCapabilityTypeData from '~/components/editor-capability-type-data.vue';

export default {
  components: {
    'app-conditional-details': conditionalDetailsVue,
    'app-property-input-range': propertyInputRangeVue,
    'app-labeled-input': labeledInputVue,
    'app-svg': svgVue,
    'app-editor-capability-type-data': editorCapabilityTypeData
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
      properties: schemaProperties,
      capabilityTypeHint: null
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
      this.$emit(`insert-capability-before`);

      const dialog = this.$el.closest(`dialog`);
      this.$nextTick(() => {
        const newCapability = dialog.querySelector(`.capability-editor`).children[this.capIndex - 1];
        dialog.scrollTop += newCapability.clientHeight;
      });
    },
    insertCapabilityAfter() {
      this.$emit(`insert-capability-after`);
    },
    removePreviousCapability() {
      this.$delete(this.capabilities, this.capIndex - 1);
    },
    removeCurrentCapability() {
      this.$delete(this.capabilities, this.capIndex);
    },
    removeNextCapability() {
      this.$delete(this.capabilities, this.capIndex + 1);
    },
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
    }
  }
};
</script>
