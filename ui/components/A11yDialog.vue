<template>
  <div
    :id="id"
    class="dialog-container"
    :aria-hidden="shown ? `false` : `true`"
    :aria-labelledby="`${id}-dialog-title`"
    :role="isAlertDialog ? `alertdialog` : undefined"
    @click="overlayClick($event)">

    <div
      ref="dialog"
      role="document"
      class="dialog card"
      :class="{ wide }">
      <div>

        <button
          v-if="!isAlertDialog"
          type="button"
          class="icon-button close"
          title="Close"
          @click.prevent="hide()">
          Close
          <OflSvg name="close" />
        </button>

        <h2 :id="`${id}-dialog-title`" tabindex="-1" autofocus>
          <slot name="title">{{ title }}</slot>
        </h2>

        <slot />

      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes scale-up {
  from {
    transform: scale(0.9);
  }
}

$container-fade-duration: 200ms;

.dialog-container {
  position: fixed;
  z-index: 1000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.66);
  display: flex;
  animation: fade-in $container-fade-duration both;
}

.dialog-container[aria-hidden='true'] {
  display: none;
}

.dialog {
  background-color: theme-color(dialog-background);
  color: theme-color(text-primary);
  margin: auto;
  box-sizing: border-box;
  min-width: 20rem;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  overscroll-behavior: contain;
  animation:
    fade-in 200ms $container-fade-duration both,
    scale-up 200ms $container-fade-duration both;

  &.wide {
    width: 1000px;
  }


  h2:focus {
    outline: none;
  }
  // fixes padding not being visible when scrollbar is present
  &.card {
    padding: 0;

    & > div {
      padding: 1rem;
    }
  }
}

@media (max-width: $phone) {
  // make dialogs cover the whole screen
  .dialog,
  .dialog.wide {
    min-width: none;
    max-width: none;
    max-height: none;
    width: 100%;
    height: 100%;
  }
}
</style>


<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
      validator(id) {
        return id.endsWith(`-dialog`);
      },
    },
    isAlertDialog: {
      type: Boolean,
      required: false,
      default: false,
    },
    shown: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: ``,
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
  async mounted() {
    const { default: A11yDialog } = await import(`a11y-dialog`);

    this.dialog = new A11yDialog(this.$el);

    this.dialog.on(`show`, () => {
      this.$refs.dialog.scrollTop = 0;
      this.$emit(`show`);
    });

    this.dialog.on(`hide`, () => this.$emit(`hide`));

    this.update();
  },
  beforeDestroy() {
    this.dialog.destroy();
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
      if (!this.isAlertDialog && !event.target.closest(`.dialog`)) {
        this.hide();
      }
    },
  },
};
</script>
