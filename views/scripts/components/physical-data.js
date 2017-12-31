module.exports = function(Vue) {
  Vue.component('physical-data', {
    template: '#template-physical',
    props: ['value'],
    computed: {
      dimensionRequired: function() {
        return this.value.dimensionsWidth !== '' || this.value.dimensionsHeight !== '' || this.value.dimensionsDepth !== '';
      },
      degreesRequired: function() {
        return this.value.lens.degreesMin !== '' || this.value.lens.degreesMax !== '';
      }
    },
    mounted: function() {
      if (Vue._oflRestoreComplete) {
        this.$refs.firstInput.focus();
      }
    }
  });
};
