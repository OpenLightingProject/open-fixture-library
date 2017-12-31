module.exports = function(Vue) {
  Vue.component('category-chooser', {
    template: [
      '<div>',
      '  <draggable v-model="selectedCategories" element="span">',
      '    <a href="#" v-for="cat in selectedCategories" @click.prevent="deselect(cat)" class="category-badge selected"><span v-html="cat.icon"></span> {{cat.name}}</a>',
      '  </draggable>',
      '  <a href="#" v-for="cat in unselectedCategories" @click.prevent="select(cat)" class="category-badge"><span v-html="cat.icon"></span> {{cat.name}}</a>',
      '  <span class="hint">Select and reorder all applicable categories, the most suitable first.</span>',
      '</div>'
    ].join('\n'),
    props: ['value', 'allCategories'],
    computed: {
      selectedCategories: {
        get: function() {
          var self = this;
          return this.value.map(function(catName) {
            return self.allCategories.find(function(cat) {
              return cat.name === catName;
            });
          });
        },
        set: function(newSelectedCategories) {
          this.$emit('input', newSelectedCategories.map(function(cat) {
            return cat.name;
          }));
        }
      },
      unselectedCategories: function() {
        var self = this;
        return this.allCategories.filter(function(cat) {
          return self.value.indexOf(cat.name) === -1;
        });
      }
    },
    methods: {
      select: function(cat) {
        this.value.push(cat.name);
      },
      deselect: function(cat) {
        var index = this.value.indexOf(cat.name);
        this.value.splice(index, 1);
      }
    }
  });
};
