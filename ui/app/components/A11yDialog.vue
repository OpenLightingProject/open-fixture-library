<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-aria-hidden-on-focusable -- aria-hidden is dynamically toggled -->
  <div
    :id="id"
    class="dialog-container"
    :aria-hidden="shown ? `false` : `true`"
    :aria-labelledby="`${id}-dialog-title`"
    :role="isAlertDialog ? `alertdialog` : undefined"
    @click.self="overlayClick"
  >
    <div
      ref="dialogRef"
      role="document"
      class="dialog card"
      :class="{ wide }"
    >
      <div>
        <button
          v-if="!isAlertDialog"
          type="button"
          class="icon-button close"
          title="Close"
          @click.prevent="hide"
        >
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
import A11yDialog from 'a11y-dialog'

// Props
const props = defineProps<{
  id: string;
  isAlertDialog?: boolean;
  shown?: boolean;
  title: string;
  wide?: boolean;
}>();

// Defaults for optional props (matching original withDefault)
const isAlertDialog = props.isAlertDialog ?? false;
const shown = ref(props.shown ?? true);
const wide = props.wide ?? false;
const { id, title } = props;

// Emits
const emit = defineEmits<{
  (e: 'show'): void;
  (e: 'hide'): void;
}>();

// Refs
const dialogRef = ref<HTMLDivElement | null>(null);
const a11yInstance = shallowRef<{
  show: () => void;
  hide: () => void;
  on: (event: 'show' | 'hide', cb: () => void) => void;
  off?: (event: 'show' | 'hide', cb: () => void) => void;
  destroy: () => void;
} | null>(null);

// API equivalents
const show = () => a11yInstance.value?.show();
const hide = () => a11yInstance.value?.hide();

// Keep local shown in sync with incoming prop changes
watch(
  () => props.shown,
  val => {
    shown.value = val ?? true;
    update();
  },
  { immediate: true }
);

// Update helper (mirrors original update method)
function update() {
  if (shown.value) {
    show();
  } else {
    hide();
  }
}

// Overlay click (close only if not alert dialog)
function overlayClick() {
  if (!isAlertDialog) {
    hide();
  }
}

onMounted(() => {
  // Create dialog instance on the root element (component's root)
  // In <script setup>, get current root via closest('.dialog-container') from inner ref
  const container = dialogRef.value?.closest('.dialog-container') as HTMLElement | null;
  if (!container) return;

  const instance = new A11yDialog(container);
  a11yInstance.value = instance;

  instance.on('show', () => {
    // Reset scroll position like original this.$refs.dialog.scrollTop = 0
    if (dialogRef.value) {
      dialogRef.value.scrollTop = 0;
    }
    emit('show');
  });

  instance.on('hide', () => {
    emit('hide');
  });

  update();
});

onBeforeUnmount(() => {
  a11yInstance.value?.destroy();
});
</script>
