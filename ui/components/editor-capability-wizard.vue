<template>
  <div class="capability-wizard">

    Generate multiple capabilities with same range width. Occurences of '#' in text fields will be replaced by an increasing number.

    <section>
      <label>
        <app-labeled-value label="DMX start value">
          <input
            ref="firstInput"
            v-model.number="wizard.start"
            :max="dmxMax"
            type="number"
            min="0"
            step="1">
        </app-labeled-value>
      </label>
    </section>

    <section>
      <label>
        <app-labeled-value label="Range width">
          <input
            v-model.number="wizard.width"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </app-labeled-value>
      </label>
    </section>

    <section>
      <label>
        <app-labeled-value label="Count">
          <input
            v-model.number="wizard.count"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </app-labeled-value>
      </label>
    </section>

    <app-editor-capability-type-data
      v-model="wizard.templateCapability" />

    <table class="capabilities-table">
      <colgroup>
        <col style="width: 5.8ex">
        <col style="width: 1ex">
        <col style="width: 5.8ex">
        <col>
      </colgroup>
      <thead><tr>
        <th colspan="3" style="text-align: center">DMX values</th>
        <th>Capability</th>
      </tr></thead>
      <tbody>
        <tr v-for="capability in allCapabilities" :key="capability.uuid" :class="capability.source">
          <td class="capability-dmxRange0"><code>{{ capability.dmxRange[0] }}</code></td>
          <td class="capability-dmxRange-separator"><code>…</code></td>
          <td class="capability-dmxRange1"><code>{{ capability.dmxRange[1] }}</code></td>
          <td class="capability-type">{{ capability.type }}</td>
        </tr>
      </tbody>
    </table>

    <span v-if="error" class="error-message">{{ error }}</span>

    <div class="button-bar right">
      <button :disabled="error" class="restore primary" @click.prevent="apply">Generate capabilities</button>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

/* TODO: a lot of this stuff is duplicated in fixture-capability-table.vue */

.capabilities-table {
  margin-top: 1em;
  border-collapse: collapse;
  table-layout: fixed;
}

th {
  font-weight: normal;
  color: $secondary-text-dark;
}

td, th {
  padding: 0 4px;
  vertical-align: top;
}

.capability-dmxRange0 {
  text-align: right;
  padding-right: 2px;
}

.capability-dmxRange-separator {
  text-align: center;
  padding-left: 0;
  padding-right: 0;
}

.capability-dmxRange1 {
  text-align: left;
  padding-left: 2px;
}

.inherited,
.inherited code {
  color: $disabled-text-dark;
}
.computed,
.computed code {
  color: $primary-text-dark;
}
</style>

<script>
import {
  getEmptyCapability,
  isCapabilityChanged,
  clone
} from "~/assets/scripts/editor-utils.mjs";

import editorCapabilityTypeDataVue from '~/components/editor-capability-type-data.vue';
import labeledValueVue from '~/components/labeled-value.vue';

export default {
  components: {
    'app-editor-capability-type-data': editorCapabilityTypeDataVue,
    'app-labeled-value': labeledValueVue
  },
  props: {
    capabilities: {
      type: Array,
      required: true
    },
    fineness: {
      type: Number,
      required: true
    },
    formstate: {
      type: Object,
      required: true
    },
    wizard: {
      type: Object,
      required: true
    }
  },
  computed: {
    /**
     * @returns {!number} Maximum allowed DMX value.
     */
    dmxMax() {
      return Math.pow(256, this.fineness) - 1;
    },

    /**
     * @returns {!number} Index in capabilities array where the generated capabilities need to be inserted.
     */
    insertIndex() {
      // loop from inherited capabilities array end to start
      for (let i = this.capabilities.length - 1; i >= 0; i--) {
        if (this.capabilities[i].dmxRange !== null && this.capabilities[i].dmxRange[1] !== null && this.capabilities[i].dmxRange[1] < this.wizard.start) {
          return i + 1;
        }
      }

      return 0;
    },

    /**
     * @returns {!Array.<object>} Generated capabilities. An empty capability is prepended to fill the gap if neccessary.
     */
    computedCapabilites() {
      const capabilities = [];

      const prevCapability = this.capabilities[this.insertIndex - 1];
      if (
        (!prevCapability && this.wizard.start > 0) ||
        (prevCapability && prevCapability.dmxRange !== null && this.wizard.start > prevCapability.dmxRange[1] + 1)
      ) {
        // empty capability filling the gap before generated capabilities
        capabilities.push(getEmptyCapability());
      }

      for (let i = 0; i < this.wizard.count; i++) {
        const cap = getEmptyCapability();

        cap.dmxRange = [
          this.wizard.start + (i * this.wizard.width),
          this.wizard.start + ((i + 1) * this.wizard.width) - 1
        ];
        cap.type = this.wizard.templateCapability.type;
        cap.typeData = clone(this.wizard.templateCapability.typeData);

        const textProperties = [`effectName`, `comment`];
        textProperties.forEach(textProperty => {
          if (textProperty in cap.typeData) {
            cap.typeData[textProperty] = cap.typeData[textProperty].replace(/#/, i + 1);
          }
        });

        capabilities.push(cap);
      }

      return capabilities;
    },

    /**
     * @returns {!number} Number of (empty) capabilities to remove after the generated ones.
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
     * @returns {!number} DMX value range end of the last generated capability.
     */
    end() {
      return this.computedCapabilites.length === 0 ? -1 : this.computedCapabilites[this.computedCapabilites.length - 1].dmxRange[1];
    },

    /**
     * @returns {!Array.<object>} Array of all capabilities (generated and inherited), combined with their source. @see getCapabilityWithSource
     */
    allCapabilities() {
      const inheritedCapabilities = this.capabilities.map(
        cap => getCapabilityWithSource(cap, `inherited`)
      );

      const computedCapabilites = this.computedCapabilites.map(
        cap => getCapabilityWithSource(cap, `computed`)
      );

      // insert all computed capabilities at insertIndex
      inheritedCapabilities.splice(this.insertIndex, this.removeCount, ...computedCapabilites);

      return inheritedCapabilities.filter(
        cap => cap.dmxRange !== null
      );
    },

    /**
     * Performs validation of the user input.
     * @returns {?string} A string with an validation error, or null if there is no error.
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
     * @returns {?string} A string with an error that prevents the generated capabilities from being saved, or null if there is no error.
     */
    error() {
      if (this.validationError) {
        return this.validationError;
      }

      if (this.end > this.dmxMax) {
        return `Capabilities must not end above DMX value ${this.dmxMax}.`;
      }

      const collisionDetected = this.capabilities.some(cap => {
        if (cap.dmxRange === null) {
          return false;
        }

        // if only start or end is set, assume a one-value dmxRange (e.g. [43, 43])
        const capStart = cap.dmxRange[0] === null ? cap.dmxRange[1] : cap.dmxRange[0];
        const capEnd = cap.dmxRange[1] === null ? cap.dmxRange[0] : cap.dmxRange[1];

        return capEnd >= this.wizard.start && capStart <= this.end;
      });
      if (collisionDetected) {
        return `Generated capabilities must not overlap with existing ones.`;
      }

      return null;
    }
  },
  mounted() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }

    let lastOccupied = -1;
    for (let i = this.capabilities.length - 1; i >= 0; i--) {
      const cap = this.capabilities[i];

      if (cap.dmxRange === null) {
        continue;
      }

      if (cap.dmxRange[1] !== null) {
        lastOccupied = cap.dmxRange[1];
        break;
      }

      if (cap.dmxRange[0] !== null) {
        lastOccupied = cap.dmxRange[0];
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
      for (const cap of this.capabilities) {
        if (cap.type !== ``) {
          cap.open = false;
        }
      }

      // insert all computed capabilities at insertIndex
      this.capabilities.splice(this.insertIndex, this.removeCount, ...this.computedCapabilites);

      this.$emit(`close`, this.insertIndex);
    }
  }
};

/**
 * @param {!object} cap The "full" capability object.
 * @param {!string} source The source of the capability (inherited or computed).
 * @returns {!object} A capability object that additionally contains the specified source.
 */
function getCapabilityWithSource(cap, source) {
  return Object.assign({}, cap, { source });
}
</script>
