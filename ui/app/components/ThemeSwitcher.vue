<template>
  <button
    v-if="cssVariablesSupported"
    type="button"
    :title="`Switch to ${otherTheme.value} theme`"
    @click.prevent="toggleTheme()"
  >
    <OflSvg name="theme-light-dark" />
  </button>
</template>

<script setup lang="ts">
// Constants/config
const storageKey = 'theme';

let cookieName = 'theme';
const cookieOptions: {
  path: string;
  maxAge: number;
  sameSite: boolean | 'Lax' | 'Strict' | 'None';
  secure?: boolean;
} = {
  path: '/',
  maxAge: 60 * 60 * 24 * 7 * 4, // 4 weeks
  sameSite: true,
};

if (import.meta.env.PROD) {
  cookieName = '__Host-theme';
  cookieOptions.secure = true;
}

// Refs/state
const cssVariablesSupported = ref(false);
const theme = ref<'light' | 'dark'>('light');
const prefersDarkQuery = ref<MediaQueryList | null>(null);

// Derived
const otherTheme = computed(() => (theme.value === 'light' ? 'dark' : 'light'));

// Cookie write (SSR helpers like @nuxtjs/axios cookies plugin are not available here,
// so we write a plain document.cookie in the browser)
function setThemeCookie(value: string) {
  // Only in browser
  if (typeof document === 'undefined') return;
  const attrs = [
    `Path=${cookieOptions.path}`,
    `Max-Age=${cookieOptions.maxAge}`,
    `SameSite=${cookieOptions.sameSite === true ? 'Lax' : cookieOptions.sameSite}`,
    cookieOptions.secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
  document.cookie = `${encodeURIComponent(cookieName)}=${encodeURIComponent(value)}; ${attrs}`;
}

// Head manager: update <html data-theme> and meta[name="theme-color"]
// In Nuxt 3, you'd prefer useHead. Here we update directly for a framework-agnostic Vue 3 component.
function applyThemeToDom() {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme.value);

  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = theme.value === 'dark' ? '#383838' : '#fafafa'; // mirrors SCSS comment
}

// Helpers
function getDefaultPreferredTheme() {
  return prefersDarkQuery.value?.matches ? 'dark' : 'light';
}

function readThemeFromStorage(): 'light' | 'dark' {
  const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(storageKey)) || '';
  return (saved as 'light' | 'dark') || getDefaultPreferredTheme();
}

// Event handlers
function onMediaQueryChange() {
  theme.value = readThemeFromStorage();
}

function onStorageChange(e: StorageEvent) {
  if (e.key === storageKey) {
    theme.value = readThemeFromStorage();
  }
}

// Public action
function toggleTheme() {
  theme.value = otherTheme.value;

  const defaultPref = getDefaultPreferredTheme();
  if (theme.value === defaultPref) {
    localStorage.removeItem(storageKey);
  } else {
    localStorage.setItem(storageKey, theme.value);
  }
}

// Lifecycle
onMounted(() => {
  cssVariablesSupported.value = typeof window !== 'undefined' && !!(window.CSS && CSS.supports('color', 'var(--primary)'));
  if (!cssVariablesSupported.value) return;

  // Setup media query
  prefersDarkQuery.value = window.matchMedia('(prefers-color-scheme: dark)');
  // Modern API
  if (typeof prefersDarkQuery.value.addEventListener === 'function') {
    prefersDarkQuery.value.addEventListener('change', onMediaQueryChange);
  } else {
    // Legacy Safari
    prefersDarkQuery.value.addListener(onMediaQueryChange);
  }

  // Initial theme
  theme.value = readThemeFromStorage();

  // Cross-tab sync
  window.addEventListener('storage', onStorageChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorageChange);
  const mq = prefersDarkQuery.value;
  if (mq) {
    if (typeof mq.removeEventListener === 'function') {
      mq.removeEventListener('change', onMediaQueryChange);
    } else {
      mq.removeListener(onMediaQueryChange);
    }
  }
});

// Reactive side effects: write cookie and update head whenever theme changes
watchEffect(() => {
  setThemeCookie(theme.value);
  applyThemeToDom();
});
</script>
