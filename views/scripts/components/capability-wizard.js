var utils = require('../fixture-editor-utils.js');

module.exports = function(Vue) {
  Vue.component('capability-wizard', {
    template: [
      '<div class="capability-wizard">',

      'Generate multiple capabilities with same range width.',

      '<section>',
      '  <label>',
      '    <span class="label">DMX start value</span>',
      '    <span class="value">',
      '      <input type="number" min="0" :max="dmxMax" step="1" v-model.number="wizard.start" ref="firstInput" />',
      '    </span>',
      '  </label>',
      '</section>',

      '<section>',
      '  <label>',
      '    <span class="label">Range width</span>',
      '    <span class="value">',
      '      <input type="number" min="1" :max="dmxMax" step="1" v-model.number="wizard.width" />',
      '    </span>',
      '  </label>',
      '</section>',

      '<section>',
      '  <label>',
      '    <span class="label">Count</span>',
      '    <span class="value">',
      '      <input type="number" min="1" :max="dmxMax" step="1" v-model.number="wizard.count" />',
      '    </span>',
      '  </label>',
      '</section>',

      '<section>',
      '  <label>',
      '    <span class="label">Name</span>',
      '    <span class="value">',
      '      <input type="text" required v-model.number="wizard.templateName" />',
      '      <span class="hint"># will be replaced with an increasing number</span>',
      '    </span>',
      '  </label>',
      '</section>',

      '<table class="capabilities-table computed">',
      '<colgroup>',
      '  <col style="width: 5.8ex">',
      '  <col style="width: 1ex">',
      '  <col style="width: 5.8ex">',
      '  <col>',
      '</colgroup>',
      '<thead><tr>',
      '  <th colspan="3" style="text-align: center">DMX values</th>',
      '  <th>Capability</th>',
      '</tr></thead>',
      '<tbody>',
      '  <tr v-for="capability in allCapabilities" :class="capability.type">',
      '    <td class="capability-range0"><code>{{capability.start}}</code></td>',
      '    <td class="capability-range-separator"><code>…</code></td>',
      '    <td class="capability-range1"><code>{{capability.end}}</code></td>',
      '    <td class="capability-name">{{capability.name}}</td>',
      '  </tr>',
      '</tbody>',
      '</table>',

      '<span class="error-message" v-if="error">{{error}}</span>',

      '<div class="button-bar right">',
      '<button class="restore primary" :disabled="error" @click.prevent="apply">Generate capabilities</button>',
      '</div>',

      '</div>'
    ].join('\n'),
    props: ['capabilities', 'fineness', 'wizard'],
    mounted: function() {
      if (Vue._oflRestoreComplete) {
        this.$refs.firstInput.focus();
      }

      var lastOccupied = -1;
      for (var i = this.capabilities.length - 1; i >= 0; i--) {
        if (this.capabilities[i].end !== '') {
          lastOccupied = this.capabilities[i].end;
          break;
        }
        if (this.capabilities[i].start !== '') {
          lastOccupied = this.capabilities[i].start;
          break;
        }
      }

      this.wizard.start = lastOccupied + 1;
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
        for (var i = this.capabilities.length - 1; i >= 0; i--) {
          if (this.capabilities[i].end !== '' && this.capabilities[i].end < this.wizard.start) {
            return i + 1;
          }
        }

        return 0;
      },

      /**
       * @returns {!Array.<object>} Generated capabilities. An empty capability is prepended to fill the gap if neccessary.
       */
      computedCapabilites: function() {
        var capabilities = [];

        var prevCapability = this.capabilities[this.insertIndex - 1];
        if ((!prevCapability && this.wizard.start > 0) || (prevCapability && this.wizard.start > prevCapability.end + 1)) {
          // empty capability filling the gap before generated capabilities
          capabilities.push(utils.getEmptyCapability());
        }

        for (var i = 0; i < this.wizard.count; i++) {
          var cap = utils.getEmptyCapability();

          cap.start = this.wizard.start + (i * this.wizard.width);
          cap.end = cap.start + this.wizard.width - 1;
          cap.name = this.wizard.templateName.replace(/#/g, i + 1);

          capabilities.push(cap);
        }

        return capabilities;
      },

      /**
       * @returns {!number} Number of (empty) capabilities to remove after the generated ones.
       */
      removeCount: function() {
        var nextCapability = this.capabilities[this.insertIndex];
        if (nextCapability && utils.isCapabilityChanged(nextCapability)) {
          // non-empty capability (should not occur here, but should not be removed anyway)
          return 0;
        }

        if (this.end === this.dmxMax) {
          return 1;
        }

        var nextNonEmptyCapability = this.capabilities[this.insertIndex + 1];
        if (nextNonEmptyCapability && this.end + 1 === nextNonEmptyCapability.start) {
          return 1;
        }

        return 0;
      },

      /**
       * @returns {!number} DMX value range end of the last generated capability.
       */
      end: function() {
        return this.computedCapabilites[this.computedCapabilites.length - 1].end;
      },

      /**
       * @returns {!Array.<object>} Array with a typed capability object (@see getTypedCapability) for each capability (generated and inherited).
       */
      allCapabilities: function() {
        var self = this;

        var inheritedCapabilities = this.capabilities.map(function(cap) {
          return self.getTypedCapability(cap, 'inherited');
        });

        var computedCapabilites = this.computedCapabilites.map(function(cap) {
          return self.getTypedCapability(cap, 'computed');
        });

        // insert all computed capabilities at insertIndex
        // ES2015: inheritedCapabilities.splice(this.insertIndex, this.removeCount, ...computedCapabilities);
        Array.prototype.splice.apply(inheritedCapabilities, [this.insertIndex, this.removeCount].concat(computedCapabilites));

        return inheritedCapabilities.filter(function(cap) {
          return cap.start !== '' || cap.end !== '' || cap.name !== '';
        });
      },

      /**
       * @returns {?string} A string with an error that prevents the generated capabilities from being saved, or null if there is no error.
       */
      error: function() {
        var self = this;

        if (this.wizard.start < 0) {
          return 'Capabilities must not start below DMX value 0.';
        }

        if (this.end > this.dmxMax) {
          return 'Capabilities must not end above DMX value ' + this.dmxMax + '.';
        }

        var collisionDetected = this.capabilities.some(function(cap) {
          if (cap.start === '' && cap.end === '') {
            return false;
          }

          // if only start or end is set, assume a one-value range (e.g. [43, 43])
          var capStart = cap.start === '' ? cap.end : cap.start;
          var capEnd = cap.end === '' ? cap.start : cap.end;

          return capEnd >= self.wizard.start && capStart <= self.end;
        });
        if (collisionDetected) {
          return 'Generated capabilities must not overlap with existing ones.';
        }

        return null;
      }
    },
    methods: {
      /**
       * @param {!object} cap The "full" capability object.
       * @param {!string} type The type of the capability (inherited or computed).
       * @returns {!object} A "lightweight" capability object that does only contain its DMX range, name and type.
       */
      getTypedCapability: function(cap, type) {
        return {
          start: cap.start,
          end: cap.end,
          name: cap.name,
          type: type
        };
      },

      /**
       * Applies the generated capabilities into the capabilities prop and emits a "close" event.
       */
      apply: function() {
        if (this.error) {
          return;
        }

        // insert all computed capabilities at insertIndex
        // ES2015: this.capabilities.splice(this.insertIndex, this.removeCount, ...this.computedCapabilities);
        Array.prototype.splice.apply(this.capabilities, [this.insertIndex, this.removeCount].concat(this.computedCapabilites));

        this.$emit('close');
      }
    }
  });
};
