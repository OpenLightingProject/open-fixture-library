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
    if (!window.CSS && !CSS.supports(`color`, `var(--primary)`)) {
      return;
    }

    this.cssVariablesSupported = true;
    this.prefersDarkMediaQuery = window.matchMedia(`(prefers-color-scheme: dark)`);
    this.prefersDarkMediaQuery.addListener(this.onMediaQueryMatchChange);

    this.onMediaQueryMatchChange(this.prefersDarkMediaQuery);
  },
  beforeDestroy() {
    if (this.prefersDarkMediaQuery) {
      this.prefersDarkMediaQuery.removeListener(this.onMediaQueryMatchChange);
    }
  },
  methods: {
    onMediaQueryMatchChange(e) {
      const savedTheme = localStorage.getItem(`theme`);
      this.theme = savedTheme || (e.matches ? `dark` : `light`);
    },
    toggleTheme() {
      this.theme = this.otherTheme;
      localStorage.setItem(`theme`, this.theme);
    }
  }
};
</script>
