<template>
  <div
    :aria-hidden="shown ? `false` : `true`"
    class="fullscreen"
    tabindex="-1"
    @click="overlayClick">
    <div class="backdrop" tabindex="-1" />

    <div class="dialog-wrapper" :class="{ wide }">
      <dialog
        :id="`${id}-dialog`"
        :aria-labelledby="id + '-dialog-title'"
        :open="shown"
        class="card">
        <div>

          <button
            v-if="cancellable"
            type="button"
            class="icon-button close"
            title="Close"
            @click.prevent="hide">
            Close
            <OflSvg name="close" />
          </button>

          <h2 :id="`${id}-dialog-title`" tabindex="-1" autofocus>
            {{ title }}
            <slot name="after-title" />
          </h2>

          <slot />

        </div>
      </dialog>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fullscreen {
  outline: none;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* fixes bug with hiding app bars on mobile */
  /* (avoid 'width: 100vw' as this includes the scroll bar) */
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.backdrop {
  background-color: rgba(0, 0, 0, 0.66);
  position: absolute;
  width: 100%;
  height: 100%;
}

.fullscreen[aria-hidden=true],
[data-a11y-dialog-native] > .backdrop {
  display: none;
}

.fullscreen > .dialog-wrapper {
  height: 100vh;
  width: 100vw;
  padding: 16px;
  max-width: 650px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  &.wide {
    max-width: 1000px;
  }
}

dialog {
  background-color: theme-color(dialog-background);
  color: theme-color(text-primary);
  border: 0;
  z-index: 1010;
  margin: 0;
  min-width: 20rem;
  max-height: 100%;
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
</style>


<script>
const A11yDialog = process.browser ? require(`a11y-dialog`) : null;

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    cancellable: {
      type: Boolean,
      required: false,
      default: true,
    },
    shown: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    wide: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      dialog: null,
    };
  },
  watch: {
    shown: `update`,
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
    },
  },
};
</script>
