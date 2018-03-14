var utils = require('../fixture-editor-utils.js');

module.exports = function(Vue) {
  Vue.component('channel-capability', {
    template: '#template-capability',
    props: ['value', 'capIndex', 'fineness'],
    data: function() {
      var data = {
        dmxMin: 0,
        capabilities: utils.clone(this.value)
      };
      data.capability = data.capabilities[this.capIndex];
      return data;
    },
    computed: {
      dmxMax: function() {
        return Math.pow(256, this.fineness + 1) - 1;
      },
      isChanged: function() {
        return this.capabilities.some(utils.isCapabilityChanged);
      },
      startMin: function() {
        var min = this.dmxMin;
        var index = this.capIndex - 1;
        while (index >= 0) {
          var cap = this.capabilities[index];
          if (cap.end !== '') {
            min = cap.end + 1;
            break;
          }
          if (cap.start !== '') {
            min = cap.start + 1;
            break;
          }
          index--;
        }
        return min;
      },
      startMax: function() {
        if (this.capIndex === 0) {
          return this.dmxMin;
        }

        return this.capability.end !== '' ? this.capability.end : this.endMax;
      },
      endMin: function() {
        if (this.capIndex === this.capabilities.length) {
          return this.dmxMax;
        }

        return this.capability.start !== '' ? this.capability.start : this.startMin;
      },
      endMax: function() {
        var max = this.dmxMax;
        var index = this.capIndex + 1;
        while (index < this.capabilities.length) {
          var cap = this.capabilities[index];
          if (cap.start !== '') {
            max = cap.start - 1;
            break;
          }
          if (cap.end !== '') {
            max = cap.end - 1;
            break;
          }
          index++;
        }
        return max;
      }
    },
    watch: {
      'capability.start': function() {
        var prevCap = this.capabilities[this.capIndex - 1];

        if (typeof this.capability.start !== 'number') {
          if (!this.isChanged) {
            this.collapseWithNeighbors();
          }
          return;
        }

        if (prevCap) {
          if (utils.isCapabilityChanged(prevCap)) {
            if (this.capability.start > this.startMin) {
              // add item before
              this.capabilities.splice(this.capIndex, 0, utils.getEmptyCapability());
              this.$emit('scroll-item-inserted', this.capIndex);
            }
          }
          else if (this.capability.start <= this.startMin) {
            // remove previous item
            this.capabilities.splice(this.capIndex - 1, 1);
          }
        }
        else if (this.capability.start > this.dmxMin) {
          // add item before
          this.capabilities.splice(this.capIndex, 0, utils.getEmptyCapability());
          this.$emit('scroll-item-inserted', this.capIndex);
        }

        this.emitChanges();
      },
      'capability.end': function() {
        var nextCap = this.capabilities[this.capIndex + 1];

        if (typeof this.capability.end !== 'number') {
          if (!this.isChanged) {
            this.collapseWithNeighbors();
          }
          return;
        }

        if (nextCap) {
          if (utils.isCapabilityChanged(nextCap)) {
            if (this.capability.end < this.endMax) {
              // add item after
              this.capabilities.splice(this.capIndex + 1, 0, utils.getEmptyCapability());
            }
          }
          else if (this.capability.end >= this.endMax) {
            // remove next item
            this.capabilities.splice(this.capIndex + 1, 1);
          }
        }
        else if (this.capability.end < this.dmxMax) {
          // add item after
          this.capabilities.splice(this.capIndex + 1, 0, utils.getEmptyCapability());
        }

        this.emitChanges();
      },
      'capability.name': function() {
        this.emitChanges();
      },
      'capability.color': function() {
        this.emitChanges();
      },
      'capability.color2': function() {
        this.emitChanges();
      },
      'value': function() {
        this.capabilities = utils.clone(this.value);
        this.capability = this.capabilities[this.capIndex];
      },
      'capIndex': function() {
        this.capability = this.capabilities[this.capIndex];
      }
    },
    methods: {
      remove: function() {
        var emptyCap = utils.getEmptyCapability();
        for (var prop in emptyCap) {
          if (Object.hasOwnProperty.call(emptyCap, prop)) {
            this.capability[prop] = emptyCap[prop];
          }
        }
        this.collapseWithNeighbors();
      },
      collapseWithNeighbors: function() {
        var prevCap = this.capabilities[this.capIndex - 1];
        var nextCap = this.capabilities[this.capIndex + 1];

        if (prevCap && !utils.isCapabilityChanged(prevCap)) {
          if (nextCap && !utils.isCapabilityChanged(nextCap)) {
            // remove previous and current item
            this.capabilities.splice(this.capIndex - 1, 2);
            this.emitChanges();
          }
          else {
            // remove previous item
            this.capabilities.splice(this.capIndex - 1, 1);
            this.emitChanges();
          }
        }
        else if (nextCap && !utils.isCapabilityChanged(nextCap)) {
          // remove next item
          this.capabilities.splice(this.capIndex + 1, 1);
          this.emitChanges();
        }
      },
      emitChanges: function() {
        this.$emit('input', this.capabilities);
      }
    }
  });
};
