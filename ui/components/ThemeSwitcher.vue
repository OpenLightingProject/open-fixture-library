<template>
  <a
    v-if="cssVariablesSupported"
    href="#theme"
    aria-hidden="true"
    :title="`Switch to ${otherTheme} theme`"
    @click.prevent="toggleTheme">
    <OflSvg name="theme-light-dark" />
  </a>
</template>

<script>
const storageKey = `theme`;

export default {
  data() {
    return {
      cssVariablesSupported: false,
      theme: `light`,
      prefersDarkMediaQuery: null,
    };
  },
  computed: {
    otherTheme() {
      return this.theme === `light` ? `dark` : `light`;
    },
  },
  watch: {
    theme: {
      handler(theme) {
        document.documentElement.setAttribute(`data-theme`, theme);
      },
      immediate: true,
    },
  },
  created() {
    this.cssVariablesSupported = window.CSS && CSS.supports(`color`, `var(--primary)`);

    if (!this.cssVariablesSupported) {
      return;
    }

    window.addEventListener(`storage`, this.onStorageChange);

    this.prefersDarkMediaQuery = window.matchMedia(`(prefers-color-scheme: dark)`);
    this.prefersDarkMediaQuery.addListener(this.onMediaQueryMatchChange);

    this.onMediaQueryMatchChange();
  },
  beforeDestroy() {
    window.removeEventListener(`storage`, this.onStorageChange);

    if (this.prefersDarkMediaQuery) {
      this.prefersDarkMediaQuery.removeListener(this.onMediaQueryMatchChange);
    }
  },
  methods: {
    getDefaultPreferredTheme() {
      return this.prefersDarkMediaQuery.matches ? `dark` : `light`;
    },
    onMediaQueryMatchChange() {
      const savedTheme = localStorage.getItem(storageKey);
      this.theme = savedTheme || this.getDefaultPreferredTheme();
    },
    onStorageChange({ key, newValue }) {
      if (key === storageKey) {
        // theme changed in another browser tab
        this.theme = newValue || this.getDefaultPreferredTheme();
      }
    },
    toggleTheme() {
      this.theme = this.otherTheme;

      if (this.theme === this.getDefaultPreferredTheme()) {
        localStorage.removeItem(storageKey);
      }
      else {
        localStorage.setItem(storageKey, this.theme);
      }
    },
  },
};
</script>
