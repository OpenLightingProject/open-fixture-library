var A11yDialog = require('a11y-dialog');

module.exports = function(Vue) {
  Vue.component('a11y-dialog', {
    template: '#template-dialog',
    props: ['id', 'cancellable', 'shown'],
    watch: {
      shown: function() {
        this[this.shown ? 'show' : 'hide']();
      }
    },
    mounted: function() {
      var self = this;
      this.dialog = new A11yDialog(this.$el, '#header, #fixture-editor > form');
      this.dialog.on('show', function(node) {
        node.querySelector('h2').focus();
        self.$emit('show');
      });
      this.dialog.on('hide', function(node) {
        self.$emit('hide');
      });
    },
    methods: {
      show: function() {
        this.dialog.show();
      },
      hide: function() {
        this.dialog.hide();
      },
      overlayClick: function() {
        if (this.cancellable) {
          this.hide();
        }
      }
    }
  });
};
