<template>
  <div class="dialog-container" aria-hidden="true">
    <div class="dialog-overlay" tabindex="-1" @click="overlayClick" />

    <div class="dialog card" :aria-labelledby="id + '-dialog-title'" role="dialog">
      <div role="document">

        <a
          v-if="cancellable"
          href="#close"
          @click.prevent="hide"
          class="close">
          Close
          <app-svg name="close" />
        </a>

        <h2 :id="`${id}-dialog-title`" tabindex="0">{{ title }}</h2>

        <slot />

      </div>
    </div>
  </div>
</template>

<script>
import A11yDialog from 'a11y-dialog';

export default {
  props: {
    'id': {
      type: String,
      required: true
    },
    'cancellable': {
      type: Boolean,
      required: false,
      default: true
    },
    'shown': {
      type: Boolean,
      required: true
    },
    'title': {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialog: null
    };
  },
  watch: {
    shown: function() {
      if (this.shown) {
        this.show();
      }
      else {
        this.hide();
      }
    }
  },
  mounted: function() {
    this.dialog = new A11yDialog(this.$el, `#header, #fixture-editor > form`);

    this.dialog.on(`show`, node => {
      node.querySelector(`h2`).focus();
      this.$emit(`show`);
    });

    this.dialog.on(`hide`, node => this.$emit(`hide`));
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
};
</script>
