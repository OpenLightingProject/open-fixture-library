<template>
  <!-- TODO: validate everything in here -->
  <li class="capability validate-group">
    <app-property-input-range
      v-model="capability.range"
      :name="`capability${capIndex}-range`"
      :schema-property="properties.capability.range"
      :min="min"
      :max="max"
      :required="isChanged"
      @start-updated="onStartUpdated"
      @end-updated="onEndUpdated" />
    <span class="capability-data">
      <input
        v-model="capability.name"
        :required="isChanged"
        type="text"
        placeholder="name"
        class="name">
      <br>
      <input
        v-model="capability.color"
        type="text"
        placeholder="color"
        pattern="^#[0-9a-f]{6}$"
        title="#rrggbb"
        class="color">
      <input
        v-if="capability.color !== ``"
        v-model="capability.color2"
        type="text"
        placeholder="color 2"
        pattern="^#[0-9a-f]{6}$"
        title="#rrggbb"
        class="color">
    </span>
    <span class="buttons">
      <a
        v-if="isChanged"
        href="#remove"
        class="remove"
        title="Remove capability"
        @click.prevent="clear">
        <app-svg name="close" />
      </a>
    </span>
    <span class="error-message" hidden />
  </li>
</template>

<style lang="scss" scoped>
.capability {
  position: relative;
  padding: 1rem 2rem 0 0;
}

.capability-data {
  margin-left: 2ex;
  display: inline-block;
  vertical-align: top;
}

.name {
  width: 25ex;
}

.color {
  width: 10ex;
}

.remove {
  position: absolute;
  top: 1rem;
  right: 0;
  opacity: 0;
  padding: 0.3rem;
  transition: opacity 0.1s;
}

.capability:hover a,
a:focus {
  opacity: 1;
}
</style>


<script>
import schemaProperties from '~~/lib/schema-properties.js';
import {
  getEmptyCapability,
  isCapabilityChanged,
  clone
} from '~/assets/scripts/editor-utils.mjs';

import propertyInputRangeVue from '~/components/property-input-range.vue';
import svgVue from "~/components/svg.vue";

export default {
  components: {
    'app-svg': svgVue,
    'app-property-input-range': propertyInputRangeVue
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
      return this.capability.range !== null ? this.capability.range[0] : null;
    },
    end() {
      return this.capability.range !== null ? this.capability.range[1] : null;
    },
    min() {
      let min = this.dmxMin;
      let index = this.capIndex - 1;
      while (index >= 0) {
        const cap = this.capabilities[index];
        if (cap.range !== null) {
          if (cap.range[1]) {
            min = cap.range[1] + 1;
            break;
          }
          if (cap.range[0] !== null) {
            min = cap.range[0] + 1;
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
        if (cap.range !== null) {
          if (cap.range[0] !== null) {
            max = cap.range[0] - 1;
            break;
          }
          if (cap.range[1] !== null) {
            max = cap.range[1] - 1;
            break;
          }
        }
        index++;
      }
      return max;
    }
  },
  methods: {
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

      const dialog = this.$el.closest(`.dialog`);
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
    }
  }
};
</script>
