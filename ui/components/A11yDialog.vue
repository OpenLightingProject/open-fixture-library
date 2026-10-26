<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-aria-hidden-on-focusable -- aria-hidden is dynamically toggled -->
  <div
    :id="id"
    class="dialog-container"
    :aria-hidden="shown ? 'false' : 'true'"
    :aria-labelledby="`${id}-dialog-title`"
    :role="isAlertDialog ? 'alertdialog' : undefined"
    @click.self="overlayClick()">

    <div
      ref="dialogElement"
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

<script setup lang="ts">
interface Properties {
  id: string;
  isAlertDialog?: boolean;
  shown?: boolean;
  title: string;
  wide?: boolean;
}

const properties = withDefaults(defineProps<Properties>(), {
  isAlertDialog: false,
  // eslint-disable-next-line vue/no-boolean-default -- dialogs start visible unless the caller hides them
  shown: true,
  wide: false,
});

const emit = defineEmits<{
  show: [];
  hide: [];
}>();

const dialogElement = ref<HTMLElement | null>(null);
const dialog = ref<import('a11y-dialog').A11yDialogInstance | null>(null);

const update = () => {
  if (properties.shown) {
    show();
  }
  else {
    hide();
  }
};

const show = () => {
  dialog.value?.show();
};

const hide = () => {
  dialog.value?.hide();
};

const overlayClick = () => {
  if (!properties.isAlertDialog) {
    hide();
  }
};

watch(() => properties.shown, update);

onMounted(async () => {
  const { default: A11yDialog } = await import('a11y-dialog');

  const element = document.querySelector<HTMLElement>(`#${properties.id}`);
  if (!element) {
    return;
  }

  dialog.value = new A11yDialog(element);

  dialog.value.on('show', () => {
    const d = dialogElement.value;
    if (d) {
      d.scrollTop = 0;
    }
    emit('show');
  });

  dialog.value.on('hide', () => emit('hide'));

  update();
});

onUnmounted(() => {
  dialog.value?.destroy();
});

defineExpose({
  show,
  hide,
});
</script>
