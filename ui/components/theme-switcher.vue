<template>
  <a
    v-if="cssVariablesSupported"
    href="#theme"
    aria-hidden="true"
    :title="`Switch to ${otherTheme} theme`"
    @click.prevent="toggleTheme">
    <app-svg name="theme-light-dark" />
  </a>
</template>

<script>
import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-svg': svgVue
  },
  data() {
    return {
      cssVariablesSupported: false,
      theme: `light`,
      prefersDarkMediaQuery: null
    };
  },
  computed: {
    otherTheme() {
      return this.theme === `light` ? `dark` : `light`;
    }
  },
  watch: {
    theme: {
      handler(theme) {
        document.documentElement.setAttribute(`data-theme`, theme);
      },
      immediate: true
    }
  },
  created() {
    this.cssVariablesSupported = window.CSS && CSS.supports(`color`, `var(--primary)`);

    if (!this.cssVariablesSupported) {
      return;
    }

    this.prefersDarkMediaQuery = window.matchMedia(`(prefers-color-scheme: dark)`);
    this.prefersDarkMediaQuery.addListener(this.onMediaQueryMatchChange);

    this.onMediaQueryMatchChange();
  },
  beforeDestroy() {
    if (this.prefersDarkMediaQuery) {
      this.prefersDarkMediaQuery.removeListener(this.onMediaQueryMatchChange);
    }
  },
  methods: {
    getDefaultPreferredTheme() {
      return this.prefersDarkMediaQuery.matches ? `dark` : `light`;
    },
    onMediaQueryMatchChange() {
      const savedTheme = localStorage.getItem(`theme`);
      this.theme = savedTheme || this.getDefaultPreferredTheme();
    },
    toggleTheme() {
      this.theme = this.otherTheme;

      if (this.theme === this.getDefaultPreferredTheme()) {
        localStorage.removeItem(`theme`);
      }
      else {
        localStorage.setItem(`theme`, this.theme);
      }
    }
  }
};
</script>
