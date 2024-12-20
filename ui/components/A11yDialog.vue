<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-aria-hidden-on-focusable -- aria-hidden is dynamically toggled -->
  <div
    :id="id"
    class="dialog-container"
    :aria-hidden="shown ? `false` : `true`"
    :aria-labelledby="`${id}-dialog-title`"
    :role="isAlertDialog ? `alertdialog` : undefined"
    @click.self="overlayClick($event)">

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

        <h2 :id="`${id}-dialog-title`" tabindex="-1">
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
  inset: 0;
  z-index: 1000;
  display: flex;
  background-color: rgba(0, 0, 0, 66%);
  animation: fade-in $container-fade-duration both;
}

.dialog-container[aria-hidden="true"] {
  display: none;
}

.dialog {
  box-sizing: border-box;
  min-width: 20rem;
  max-width: 90%;
  max-height: 90%;
  margin: auto;
  overflow: auto;
  overscroll-behavior: contain;
  color: theme-color(text-primary);
  background-color: theme-color(dialog-background);
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
    width: 100%;
    min-width: none;
    max-width: none;
    height: 100%;
    max-height: none;
  }
}
</style>

<script>
import { booleanProp, stringProp } from 'vue-ts-types';

export default {
  props: {
    id: stringProp(
      id => (typeof id === `string` && id.endsWith(`-dialog`) ? undefined : `id should end with "-dialog".`),
    ).required,
    isAlertDialog: booleanProp().withDefault(false),
    shown: booleanProp().withDefault(true),
    title: stringProp().required,
    wide: booleanProp().withDefault(false),
  },
  emits: {
    show: () => true,
    hide: () => true,
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
      this.dialog?.show();
    },
    hide() {
      this.dialog?.hide();
    },
    overlayClick() {
      if (!this.isAlertDialog) {
        this.hide();
      }
    },
  },
};
</script>
