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
const storageKey = 'theme';

let cookieName = 'theme';
const cookieOptions = {
  path: '/',
  maxAge: 60 * 60 * 24 * 7 * 4, // 4 weeks
  sameSite: 'strict',
};

if (process.env.NODE_ENV === 'production') {
  cookieName = '__Host-theme';
  cookieOptions.secure = true;
}

function setCookie(name, value, options) {
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (options.path) {
    cookieStr += `; path=${options.path}`;
  }
  if (options.maxAge) {
    cookieStr += `; max-age=${options.maxAge}`;
  }
  if (options.sameSite) {
    cookieStr += `; samesite=${options.sameSite}`;
  }
  if (options.secure) {
    cookieStr += '; secure';
  }
  document.cookie = cookieStr;
}

export default {
  data() {
    return {
      cssVariablesSupported: false,
      theme: 'light',
      prefersDarkMediaQuery: null,
    };
  },
  computed: {
    otherTheme() {
      return this.theme === 'light' ? 'dark' : 'light';
    },
  },
  watch: {
    theme: {
      handler(theme) {
        // set cookie for server-side rendering
        if (typeof document !== 'undefined') {
          setCookie(cookieName, theme, cookieOptions);
          document.documentElement.setAttribute('data-theme', theme);
          // Update theme-color meta tag
          const themeColorMeta = document.querySelector('meta[name="theme-color"]');
          if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#383838' : '#fafafa';
          }
        }
      },
    },
  },
  mounted() {
    this.cssVariablesSupported = window.CSS && CSS.supports('color', 'var(--primary)');

    if (!this.cssVariablesSupported) {
      return;
    }

    window.addEventListener('storage', this.onStorageChange);

    this.prefersDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.prefersDarkMediaQuery.addEventListener('change', this.onMediaQueryMatchChange);

    this.onMediaQueryMatchChange();
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorageChange);

    if (this.prefersDarkMediaQuery) {
      this.prefersDarkMediaQuery.removeEventListener('change', this.onMediaQueryMatchChange);
    }
  },
  methods: {
    getDefaultPreferredTheme() {
      return this.prefersDarkMediaQuery.matches ? 'dark' : 'light';
    },
    onMediaQueryMatchChange() {
      const savedTheme = localStorage.getItem(storageKey);
      this.theme = savedTheme || this.getDefaultPreferredTheme();
    },
    onStorageChange({ key, newValue }) {
      if (key === storageKey) {
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
