<template>
  <div class="capability-wizard">

    Generate multiple capabilities with same range width.

    <section>
      <label>
        <span class="label">DMX start value</span>
        <span class="value">
          <input
            ref="firstInput"
            v-model.number="wizard.start"
            :max="dmxMax"
            type="number"
            min="0"
            step="1">
        </span>
      </label>
    </section>

    <section>
      <label>
        <span class="label">Range width</span>
        <span class="value">
          <input
            v-model.number="wizard.width"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </span>
      </label>
    </section>

    <section>
      <label>
        <span class="label">Count</span>
        <span class="value">
          <input
            v-model.number="wizard.count"
            :max="dmxMax"
            type="number"
            min="1"
            step="1">
        </span>
      </label>
    </section>

    <section>
      <label>
        <span class="label">Name</span>
        <span class="value">
          <input v-model.number="wizard.templateName" type="text" required>
          <span class="hint"># will be replaced with an increasing number</span>
        </span>
      </label>
    </section>

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
        <tr v-for="capability in allCapabilities" :key="capability.uuid" :class="capability.type">
          <td class="capability-range0"><code>{{ capability.range[0] }}</code></td>
          <td class="capability-range-separator"><code>…</code></td>
          <td class="capability-range1"><code>{{ capability.range[1] }}</code></td>
          <td class="capability-name">{{ capability.name }}</td>
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

.capability-range0 {
  text-align: right;
  padding-right: 2px;
}

.capability-range-separator {
  text-align: center;
  padding-left: 0;
  padding-right: 0;
}

.capability-range1 {
  text-align: left;
  padding-left: 2px;
}

.capability-name {
  max-width: 20em;
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
import { getEmptyCapability, isCapabilityChanged } from "~/assets/scripts/editor-utils.mjs";

export default {
  props: {
    capabilities: {
      type: Array,
      required: true
    },
    fineness: {
      type: Number,
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
    dmxMax: function() {
      return Math.pow(256, this.fineness + 1) - 1;
    },

    /**
     * @returns {!number} Index in capabilities array where the generated capabilities need to be inserted.
     */
    insertIndex: function() {
      // loop from inherited capabilities array end to start
      for (let i = this.capabilities.length - 1; i >= 0; i--) {
        if (this.capabilities[i].range !== null && this.capabilities[i].range[1] !== null && this.capabilities[i].range[1] < this.wizard.start) {
          return i + 1;
        }
      }

      return 0;
    },

    /**
     * @returns {!Array.<object>} Generated capabilities. An empty capability is prepended to fill the gap if neccessary.
     */
    computedCapabilites: function() {
      const capabilities = [];

      const prevCapability = this.capabilities[this.insertIndex - 1];
      if (
        (!prevCapability && this.wizard.start > 0) ||
        (prevCapability && prevCapability.range !== null && this.wizard.start > prevCapability.range[1] + 1)
      ) {
        // empty capability filling the gap before generated capabilities
        capabilities.push(getEmptyCapability());
      }

      for (let i = 0; i < this.wizard.count; i++) {
        const cap = getEmptyCapability();

        cap.range = [
          this.wizard.start + (i * this.wizard.width),
          this.wizard.start + ((i + 1) * this.wizard.width) - 1
        ];
        cap.name = this.wizard.templateName.replace(/#/g, i + 1);

        capabilities.push(cap);
      }

      return capabilities;
    },

    /**
     * @returns {!number} Number of (empty) capabilities to remove after the generated ones.
     */
    removeCount: function() {
      const nextCapability = this.capabilities[this.insertIndex];
      if (nextCapability && isCapabilityChanged(nextCapability)) {
        // non-empty capability (should not occur here, but should not be removed anyway)
        return 0;
      }

      if (this.end === this.dmxMax) {
        return 1;
      }

      const nextNonEmptyCapability = this.capabilities[this.insertIndex + 1];
      if (nextNonEmptyCapability && nextNonEmptyCapability.range !== null && this.end + 1 === nextNonEmptyCapability.range[0]) {
        return 1;
      }

      return 0;
    },

    /**
     * @returns {!number} DMX value range end of the last generated capability.
     */
    end: function() {
      return this.computedCapabilites[this.computedCapabilites.length - 1].range[1];
    },

    /**
     * @returns {!Array.<object>} Array with a typed capability object (@see getTypedCapability) for each capability (generated and inherited).
     */
    allCapabilities: function() {
      const inheritedCapabilities = this.capabilities.map(
        cap => getTypedCapability(cap, `inherited`)
      );

      const computedCapabilites = this.computedCapabilites.map(
        cap => getTypedCapability(cap, `computed`)
      );

      // insert all computed capabilities at insertIndex
      inheritedCapabilities.splice(this.insertIndex, this.removeCount, ...computedCapabilites);

      return inheritedCapabilities.filter(
        cap => cap.range !== null || cap.name !== ``
      );
    },

    /**
     * @returns {?string} A string with an error that prevents the generated capabilities from being saved, or null if there is no error.
     */
    error: function() {
      if (this.wizard.start < 0) {
        return `Capabilities must not start below DMX value 0.`;
      }

      if (this.end > this.dmxMax) {
        return `Capabilities must not end above DMX value ${this.dmxMax}.`;
      }

      const collisionDetected = this.capabilities.some(cap => {
        if (cap.range === null) {
          return false;
        }

        // if only start or end is set, assume a one-value range (e.g. [43, 43])
        const capStart = cap.range[0] === null ? cap.range[1] : cap.range[0];
        const capEnd = cap.range[1] === null ? cap.range[0] : cap.range[1];

        return capEnd >= this.wizard.start && capStart <= this.end;
      });
      if (collisionDetected) {
        return `Generated capabilities must not overlap with existing ones.`;
      }

      return null;
    }
  },
  mounted: function() {
    // TODO: make this work
    // if (Vue._oflRestoreComplete) {
    //   this.$refs.firstInput.focus();
    // }

    let lastOccupied = -1;
    for (let i = this.capabilities.length - 1; i >= 0; i--) {
      const cap = this.capabilities[i];

      if (cap.range === null) {
        continue;
      }

      if (cap.range[1] !== null) {
        lastOccupied = cap.range[1];
        break;
      }

      if (cap.range[0] !== null) {
        lastOccupied = cap.range[0];
        break;
      }
    }

    this.wizard.start = lastOccupied + 1;
  },
  methods: {
    /**
     * Applies the generated capabilities into the capabilities prop and emits a "close" event.
     */
    apply: function() {
      if (this.error) {
        return;
      }

      // insert all computed capabilities at insertIndex
      this.capabilities.splice(this.insertIndex, this.removeCount, ...this.computedCapabilites);

      this.$emit(`close`);
    }
  }
};

/**
 * @param {!object} cap The "full" capability object.
 * @param {!string} type The type of the capability (inherited or computed).
 * @returns {!object} A capability object that additionally contains the specified type.
 */
function getTypedCapability(cap, type) {
  return Object.assign({}, cap, { type });
}
</script>
