<template>
  <div class="capability-wizard">

    <span>Generate multiple capabilities with same range width. Occurences of '#' in text fields will be replaced by an increasing number.</span>

    <section>
      <label>
        <LabeledValue label="DMX start value">
          <input
            ref="firstInput"
            v-model.number="wizard.start"
            :max="dmxMax"
            type="number"
            min="0"
            step="1">
        </LabeledValue>
      </label>
    </section>

    <section>
      <label>
        <LabeledValue label="Range width">
          <input
            v-model.number="wizard.width"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </LabeledValue>
      </label>
    </section>

    <section>
      <label>
        <LabeledValue label="Count">
          <input
            v-model.number="wizard.count"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </LabeledValue>
      </label>
    </section>

    <EditorCapabilityTypeData
      :capability="wizard.templateCapability"
      :channel="channel" />

    <table class="capabilities-table">
      <colgroup>
        <col style="width: 5.8ex;">
        <col style="width: 1ex;">
        <col style="width: 5.8ex;">
        <col>
      </colgroup>
      <thead><tr>
        <th colspan="3" style="text-align: center;">DMX values</th>
        <th>Capability</th>
      </tr></thead>
      <tbody>
        <tr v-for="capability of allCapabilities" :key="capability.uuid" :class="capability.source">
          <td class="capability-dmx-range-start"><code>{{ capability.dmxRange[0] }}</code></td>
          <td class="capability-dmx-range-separator"><code>…</code></td>
          <td class="capability-dmx-range-end"><code>{{ capability.dmxRange[1] }}</code></td>
          <td class="capability-type">{{ capability.type }}</td>
        </tr>
      </tbody>
    </table>

    <span v-if="error" class="error-message">{{ error }}</span>

    <div class="button-bar right">
      <button
        type="button"
        :disabled="error || !wizard.templateCapability.type"
        class="restore primary"
        @click.prevent="apply()">
        Generate capabilities
      </button>
    </div>

  </div>
</template>

<style lang="scss" scoped>
// TODO: a lot of this stuff is duplicated in FixturePageCapabilityTable.vue

.capabilities-table {
  margin-top: 1em;
  table-layout: fixed;
  border-collapse: collapse;
}

th {
  font-weight: 400;
  color: theme-color(text-secondary);
}

td,
th {
  padding: 0 4px;
  vertical-align: top;
}

.capability-dmx-range-start {
  padding-right: 2px;
  text-align: right;
}

.capability-dmx-range-separator {
  padding-right: 0;
  padding-left: 0;
  text-align: center;
}

.capability-dmx-range-end {
  padding-left: 2px;
  text-align: left;
}

.inherited,
.inherited code {
  color: theme-color(text-disabled);
}

.computed,
.computed code {
  color: theme-color(text-primary);
}
</style>

<script>
import { numberProp, objectProp } from 'vue-ts-types';
import {
  getEmptyCapability,
  isCapabilityChanged,
} from "../../assets/scripts/editor-utils.js";

import LabeledValue from '../LabeledValue.vue';
import EditorCapabilityTypeData from './EditorCapabilityTypeData.vue';

/**
 * @param {object} capabilityTypeData The generated capability's type data.
 * @param {number} index The index of the generated capability.
 */
function replaceHashWithIndex(capabilityTypeData, index) {
  if (`effectName` in capabilityTypeData) {
    capabilityTypeData.effectName = capabilityTypeData.effectName.replace(/#/, index + 1);
  }
  if (`comment` in capabilityTypeData) {
    capabilityTypeData.comment = capabilityTypeData.comment.replace(/#/, index + 1);
  }
}

export default {
  components: {
    LabeledValue,
    EditorCapabilityTypeData,
  },
  props: {
    channel: objectProp().required,
    resolution: numberProp().required,
    wizard: objectProp().required,
  },
  emits: {
    close: insertIndex => true,
  },
  computed: {
    capabilities() {
      return this.channel.capabilities;
    },

    /**
     * @returns {number} Maximum allowed DMX value.
     */
    dmxMax() {
      return Math.pow(256, this.resolution) - 1;
    },

    /**
     * @returns {number} Index in capabilities array where the generated capabilities need to be inserted.
     */
    insertIndex() {
      // loop from inherited capabilities array end to start
      for (let index = this.capabilities.length - 1; index >= 0; index--) {
        if (this.capabilities[index].dmxRange !== null && this.capabilities[index].dmxRange[1] !== null && this.capabilities[index].dmxRange[1] < this.wizard.start) {
          return index + 1;
        }
      }

      return 0;
    },

    /**
     * @returns {object[]} Generated capabilities. An empty capability is prepended to fill the gap if neccessary.
     */
    computedCapabilites() {
      const capabilities = [];

      const previousCapability = this.capabilities[this.insertIndex - 1];
      if (
        (!previousCapability && this.wizard.start > 0) ||
        (previousCapability && previousCapability.dmxRange !== null && this.wizard.start > previousCapability.dmxRange[1] + 1)
      ) {
        // empty capability filling the gap before generated capabilities
        capabilities.push(getEmptyCapability());
      }

      for (let index = 0; index < this.wizard.count; index++) {
        const capability = getEmptyCapability();

        capability.dmxRange = [
          this.wizard.start + (index * this.wizard.width),
          this.wizard.start + ((index + 1) * this.wizard.width) - 1,
        ];
        capability.type = this.wizard.templateCapability.type;
        capability.typeData = structuredClone(this.wizard.templateCapability.typeData);
        replaceHashWithIndex(capability.typeData, index);

        capabilities.push(capability);
      }

      return capabilities;
    },

    /**
     * @returns {number} Number of (empty) capabilities to remove after the generated ones.
     */
    removeCount() {
      const nextCapability = this.capabilities[this.insertIndex];
      if (nextCapability && isCapabilityChanged(nextCapability)) {
        // non-empty capability (should not occur here, but should not be removed anyway)
        return 0;
      }

      if (this.end === this.dmxMax) {
        return 1;
      }

      const nextNonEmptyCapability = this.capabilities[this.insertIndex + 1];
      if (nextNonEmptyCapability && nextNonEmptyCapability.dmxRange !== null && this.end + 1 === nextNonEmptyCapability.dmxRange[0]) {
        return 1;
      }

      return 0;
    },

    /**
     * @returns {number} DMX value range end of the last generated capability.
     */
    end() {
      return this.computedCapabilites.length === 0 ? -1 : this.computedCapabilites.at(-1).dmxRange[1];
    },

    /**
     * @see {@link getCapabilityWithSource}
     * @returns {object[]} Array of all capabilities (generated and inherited), combined with their source.
     */
    allCapabilities() {
      const inheritedCapabilities = this.capabilities.map(
        capability => getCapabilityWithSource(capability, `inherited`),
      );

      const computedCapabilites = this.computedCapabilites.map(
        capability => getCapabilityWithSource(capability, `computed`),
      );

      // insert all computed capabilities at insertIndex
      inheritedCapabilities.splice(this.insertIndex, this.removeCount, ...computedCapabilites);

      return inheritedCapabilities.filter(
        capability => capability.dmxRange !== null,
      );
    },

    /**
     * Performs validation of the user input.
     * @returns {string | null} A string with an validation error, or null if there is no error.
     */
    validationError() {
      if (this.wizard.start < 0) {
        return `Capabilities must not start below DMX value 0.`;
      }

      if (this.wizard.width <= 0) {
        return `Capability width must be greater than zero.`;
      }

      if (this.wizard.start % 1 !== 0 || this.wizard.width % 1 !== 0 || this.wizard.count % 1 !== 0) {
        return `Please do only enter whole number values.`;
      }

      return null;
    },

    /**
     * @returns {string | null} A string with an error that prevents the generated capabilities from being saved, or null if there is no error.
     */
    error() {
      if (this.validationError) {
        return this.validationError;
      }

      if (this.end > this.dmxMax) {
        return `Capabilities must not end above DMX value ${this.dmxMax}.`;
      }

      const collisionDetected = this.capabilities.some(capability => {
        if (capability.dmxRange === null) {
          return false;
        }

        // if only start or end is set, assume a one-value dmxRange (e.g. [43, 43])
        const capabilityStart = capability.dmxRange[0] === null ? capability.dmxRange[1] : capability.dmxRange[0];
        const capabilityEnd = capability.dmxRange[1] === null ? capability.dmxRange[0] : capability.dmxRange[1];

        return capabilityEnd >= this.wizard.start && capabilityStart <= this.end;
      });
      if (collisionDetected) {
        return `Generated capabilities must not overlap with existing ones.`;
      }

      return null;
    },
  },
  mounted() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }

    let lastOccupied = -1;
    for (let index = this.capabilities.length - 1; index >= 0; index--) {
      const capability = this.capabilities[index];

      if (capability.dmxRange === null) {
        continue;
      }

      if (capability.dmxRange[1] !== null) {
        lastOccupied = capability.dmxRange[1];
        break;
      }

      if (capability.dmxRange[0] !== null) {
        lastOccupied = capability.dmxRange[0];
        break;
      }
    }

    this.wizard.start = lastOccupied + 1;
  },
  methods: {
    /**
     * Applies the generated capabilities into the capabilities prop and emits a "close" event.
     */
    apply() {
      if (this.error) {
        return;
      }

      // close other capabilities if they are not empty
      for (const capability of this.capabilities) {
        if (capability.type !== ``) {
          capability.open = false;
        }
      }

      // insert all computed capabilities at insertIndex
      this.capabilities.splice(this.insertIndex, this.removeCount, ...this.computedCapabilites);

      this.$emit(`close`, this.insertIndex);
    },
  },
};

/**
 * @param {object} capability The "full" capability object.
 * @param {string} source The source of the capability (inherited or computed).
 * @returns {object} A capability object that additionally contains the specified source.
 */
function getCapabilityWithSource(capability, source) {
  return { ...capability, source };
}
</script>
