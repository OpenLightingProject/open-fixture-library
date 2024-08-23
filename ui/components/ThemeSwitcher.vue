<template>
  <button
    v-if="cssVariablesSupported"
    type="button"
    :title="`Switch to ${otherTheme} theme`"
    @click.prevent="toggleTheme()">
    <OflSvg name="theme-light-dark" />
  </button>
</template>

<script>
const storageKey = `theme`;

let cookieName = `theme`;
const cookieOptions = {
  path: `/`,
  maxAge: 60 * 60 * 24 * 7 * 4, // 4 weeks
  sameSite: true,
};

if (process.env.NODE_ENV === `production`) {
  cookieName = `__Host-theme`;
  cookieOptions.secure = true;
}

export default {
  data() {
    return {
      cssVariablesSupported: false,
      theme: `light`,
      prefersDarkMediaQuery: null,
    };
  },
  head() {
    return {
      htmlAttrs: {
        'data-theme': this.theme,
      },
      meta: [
        {
          hid: `theme-color`,
          name: `theme-color`,
          content: this.theme === `dark` ? `#383838` : `#fafafa`, // SCSS: theme-color(header-background)
        },
      ],
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
        // set cookie for server-side rendering
        this.$cookies.set(cookieName, theme, cookieOptions);
      },
      immediate: true,
    },
  },
  mounted() {
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
