<template>
  <div class="dialog-container" aria-hidden="true">
    <div class="dialog-overlay" tabindex="-1" @click="overlayClick" />

    <div :aria-labelledby="id + '-dialog-title'" class="dialog card" role="dialog">
      <div role="document">

        <a
          v-if="cancellable"
          href="#close"
          class="close"
          @click.prevent="hide">
          Close
          <app-svg name="close" />
        </a>

        <h2 :id="`${id}-dialog-title`" tabindex="0">{{ title }}</h2>

        <slot />

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.dialog-container[aria-hidden="true"] {
  visibility: hidden;
}

.dialog-overlay {
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.66);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.dialog {
  background-color: rgb(255, 255, 255);
  z-index: 1010;
  position: fixed;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%) scale(0.9);
  transform: translate(-50%, -50%) scale(0.9);
  min-width: 20rem;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  transition: transform 0.1s, -webkit-transform 0.1s;
}

/* fixes padding not being visible when scrollbar is present */
.dialog.card {
  padding-bottom: 0;

  & > div {
    margin-bottom: 1rem;
  }
}

.dialog-container:not([aria-hidden="true"]) .dialog {
  -webkit-transform: translate(-50%, -50%) scale(1);
  transform: translate(-50%, -50%) scale(1);
}

.dialog h2:focus {
  outline: none;
}

@media (max-width: $phone) {
  /* make dialogs cover the whole screen */
  .dialog {
    box-sizing: border-box;
    max-width: none;
    max-height: none;
    width: 100%;
    height: 100%;
  }
}
</style>


<script>
import A11yDialog from 'a11y-dialog';

import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-svg': svgVue
  },
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
    shown: `update`
  },
  mounted() {
    this.dialog = new A11yDialog(this.$el, `#header, #fixture-editor > form`);

    this.dialog.on(`show`, node => {
      node.querySelector(`h2`).focus();
      this.$emit(`show`);
    });

    this.dialog.on(`hide`, node => this.$emit(`hide`));

    this.update();
  },
  methods: {
    update() {
      if (this.shown) {
        this.show();
      }
      else {
        this.hide();
      }
    },
    show() {
      this.dialog.show();
    },
    hide() {
      this.dialog.hide();
    },
    overlayClick() {
      if (this.cancellable) {
        this.hide();
      }
    }
  }
};
</script>
