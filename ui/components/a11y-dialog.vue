<template>
  <div class="dialog-container" tabindex="-1" @click="overlayClick">
    <div class="dialog-overlay" tabindex="-1" />

    <dialog :id="`${id}-dialog`" :aria-labelledby="id + '-dialog-title'" class="card">
      <div>

        <a
          v-if="cancellable"
          href="#close"
          class="close"
          @click.prevent="hide">
          Close
          <app-svg name="close" />
        </a>

        <h2 :id="`${id}-dialog-title`" tabindex="-1" autofocus>{{ title }}</h2>

        <slot />

      </div>
    </dialog>
  </div>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.dialog-container[aria-hidden=true],
[data-a11y-dialog-native] > :first-child {
  display: none;
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

dialog {
  background-color: rgb(255, 255, 255);
  border: 0;
  z-index: 1010;
  position: fixed;
  top: 50%;
  left: 50%;
  margin: 0;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  min-width: 20rem;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  overscroll-behavior: contain;

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.66);
  }

  &[open] {
    display: block;
  }

  & h2:focus {
    outline: none;
  }
}

/* fixes padding not being visible when scrollbar is present */
dialog.card {
  padding: 0;

  & > div {
    padding: 1rem;
  }
}

@media (max-width: $phone) {
  /* make dialogs cover the whole screen */
  dialog {
    box-sizing: border-box;
    max-width: none;
    max-height: none;
    width: 100%;
    height: 100%;
  }
}
</style>


<script>
const A11yDialog = process.browser ? require(`a11y-dialog`) : null;

import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-svg': svgVue
  },
  props: {
    id: {
      type: String,
      required: true
    },
    cancellable: {
      type: Boolean,
      required: false,
      default: true
    },
    shown: {
      type: Boolean,
      required: true
    },
    title: {
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
    if (A11yDialog) {
      this.dialog = new A11yDialog(this.$el, `#header, #fixture-editor > form`);

      this.dialog.on(`show`, node => {
        this.dialog.dialog.scrollTop = 0;
        this.$emit(`show`);
      });

      this.dialog.on(`hide`, node => this.$emit(`hide`));

      this.update();
    }
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
      if (this.dialog) {
        this.dialog.show();
      }
    },
    hide() {
      if (this.dialog) {
        this.dialog.hide();
      }
    },
    overlayClick(event) {
      if (this.cancellable && event.target.matches(`dialog, .dialog-overlay`)) {
        this.hide();
      }
    }
  }
};
</script>
