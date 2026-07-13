<template>
  <div class="container" :class="{ 'only-select-button': buttonStyle === `select` && !showHelp }">
    <!-- Display the download button as a select to make it work inside modals as well -->
    <select
      v-if="buttonStyle === `select`"
      @click="selectClicked = true"
      @keyup.enter="$event.target.blur()"
      @change="onDownloadSelectChange($event)"
      @blur="onDownloadSelectBlur($event)">
      <option value="" disabled selected>{{ title }}</option>
      <option v-for="plugin of exportPlugins" :key="plugin.key" :value="plugin.key">{{ plugin.name }}</option>
    </select>

    <!-- Display the download button as hoverable div with real links in the dropdown -->
    <div
      v-else
      class="download-button"
      :class="{ home: buttonStyle === `home` }">
      <a href="#" class="title" @click.prevent>{{ title }}</a>
      <ul>
        <li v-for="plugin of exportPlugins" :key="plugin.key">
          <a
            :href="`${baseLink}.${plugin.key}`"
            :title="`Download ${plugin.name} fixture definition${isSingle ? `` : `s`}`"
            rel="nofollow"
            @click="onDownloadButton($event, plugin.key)">
            {{ plugin.name }}
          </a>
        </li>
      </ul>
    </div>

    <NuxtLink
      v-if="showHelp"
      to="/about/plugins"
      :target="buttonStyle === `home` ? null : `_blank`"
      class="help-link">
      <OflSvg name="help-circle-outline" /><span class="name">Download instructions</span>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.container {
  margin: 0 0 1em;
  text-align: center;

  @media (width >= 650px) {
    margin: 0;
  }

  &.only-select-button {
    display: inline-block;
    margin: 0;
  }
}

.help-link {
  display: inline-block;
  margin-left: -1ex;
  font-size: 0.9rem;
  line-height: 1.2;
  color: theme-color(text-secondary);
  transition: opacity 0.15s;

  .icon {
    width: 1.2rem;
    height: 1.2rem;
    fill: theme-color(text-secondary);
  }

  .name {
    margin-left: 0.5ex;
    vertical-align: middle;
  }

  &:hover,
  &:focus {
    opacity: 0.7;
  }
}

select {
  box-sizing: content-box;
  display: inline-block;
  width: 12.5ex;
  height: 1.4em;
  padding: 0.5em 3ex;
  margin-top: 1ex;
  margin-left: 1ex;
  font-size: 0.9em;
  font-weight: 700;
  line-height: 1.4;
  color: theme-color(button-secondary-text);
  appearance: none;
  cursor: pointer;
  background: theme-color(button-secondary-background);
  border-color: theme-color(button-secondary-border);
  border-radius: 2px;
  transition: 0.1s background-color;

  &:not(:disabled):hover,
  &:not(:disabled):focus {
    background-color: theme-color(button-secondary-background-hover);
  }
}

.download-button {
  text-align: left;

  & > .title {
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 0.5ex 2ex;
    font-weight: 700;
    color: $primary-text-light;
    cursor: pointer;
    background: theme-color(orange-background);
    border-radius: 2px;
    box-shadow: 0 2px 2px rgba(#000000, 20%);
    transition: border-radius 0.2s, background-color 0.2s;

    // down arrow
    &::before {
      float: right;
      display: block;
      width: 0;
      height: 0;
      margin: 0.8em 0 0 1ex;
      content: "";
      border-color: currentcolor transparent transparent;
      border-style: solid;
      border-width: 0.4em 0.4em 0;
    }
  }

  & > ul {
    // just move the list to the left outside of the screen but don't hide it,
    // to still allow screenreaders reading it
    position: absolute;
    top: 100%;
    left: -9999px;
    z-index: 90;
    width: 100%;
    padding: 0.7em 0;
    margin: 0;
    list-style: none;
    background-color: theme-color(header-background);
    border-radius: 0 0 2px 2px;
    box-shadow: 0 2px 2px rgba(#000000, 20%);

    & a {
      display: block;
      padding: 0.2ex 2ex;
      color: theme-color(text-primary);
      transition: background-color 0.2s;
    }

    & a:hover,
    & a:focus {
      outline: 0;
      background-color: theme-color(hover-background);
    }
  }

  // separate rule since unsupporting browsers skip the whole rule
  &:focus-within > ul {
    left: 0;
  }

  &:hover > ul,
  & > .title:focus + ul,
  & > .title:active + ul {
    left: 0;
  }

  &:hover > .title,
  & > .title:focus,
  & > .title:active {
    background: theme-color(orange-background-hover);
    border-radius: 2px 2px 0 0;
  }

  &:focus-within > .title {
    background: theme-color(orange-background-hover);
    border-radius: 2px 2px 0 0;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props
const props = withDefaults(defineProps<{
  // how many fixtures will be downloaded, if !isSingle?
  fixtureCount: number;
  // fixtures from the editor, not yet submitted
  editorFixtures?: Record<string, unknown>;
  // the manufacturer key and fixture key of a submitted fixture
  fixtureKey?: string;
  // the button style: default, 'home' or 'select'
  buttonStyle?: 'default' | 'home' | 'select';
  // show the help box
  showHelp: boolean;
}>(), {
  fixtureCount: 0,
  buttonStyle: 'default',
  showHelp: false,
});

// State
const exportPlugins = ref<Array<{ key: string; name: string }>>([]);
const selectClicked = ref(false);

// Computed
const isSingle = computed(() =>
  (props.editorFixtures && (props.editorFixtures as any).fixtures && Object.keys((props.editorFixtures as any).fixtures).length === 1)
  || !!props.fixtureKey
);

const title = computed(() => {
  if (isSingle.value) {
    return 'Download as…';
  }
  return `Download all ${props.fixtureCount} fixtures`;
});

const baseLink = computed(() => {
  if (props.editorFixtures) {
    return '/download-editor';
  }
  if (isSingle.value) {
    return `/${props.fixtureKey}`;
  }
  return '/download';
});

// Axios access (Nuxt 3 style). If you use a different axios injection, adapt here.
let $axios: any | undefined;
try {
  // eslint-disable-next-line no-undef
  const nuxt = (useNuxtApp && typeof useNuxtApp === 'function') ? useNuxtApp() : undefined;
  $axios = nuxt?.$axios ?? (globalThis as any).$axios;
} catch {
  // ignore; fallback below
}
$axios = $axios ?? (globalThis as any).$axios;

// Methods
function downloadDataAsFile(blob: Blob, filename = '') {
  // IE legacy path retained from original (no-op in modern browsers)
  if ((window.navigator as any).msSaveBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
  }
  else {
    const URL_ = window.URL || (window as any).webkitURL;
    const downloadUrl = URL_.createObjectURL(blob);

    const anchorElement = document.createElement('a');

    if ((anchorElement as any).download === undefined) {
      // non-HTML5 workaround
      window.location.href = downloadUrl;
    }
    else {
      anchorElement.href = downloadUrl;
      anchorElement.download = filename;
      document.body.append(anchorElement);
      anchorElement.click();
    }

    // cleanup
    setTimeout(() => {
      URL_.revokeObjectURL(downloadUrl);
      anchorElement.remove();
    }, 100);
  }
}

async function formattedDownload(pluginKey: string) {
  if (!$axios) {
    console.error('Axios instance not available');
    return;
  }

  // download the data as a file
  const response = await $axios.post(
    `${baseLink.value}.${pluginKey}`,
    props.editorFixtures,
    { responseType: 'blob' },
  );

  // If server sends JSON error as blob, try to parse
  // But original code relied on response.data.error directly; keep the check as-is
  const disposition = response.headers?.['content-disposition'];
  let filename = '';
  if (disposition && disposition.includes('attachment')) {
    const filenameRegex = /filename[^\n;=]*=((["']).*?\2|[^\n;]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches && matches[1]) {
      filename = matches[1].replaceAll(/["']/g, '');
    }
  }

  downloadDataAsFile(response.data, filename);
}

function onDownloadButton(event: MouseEvent, pluginKey: string) {
  (event.target as HTMLElement)?.blur();

  if (!props.editorFixtures) {
    // default link target
    return;
  }

  // download the (possibly not yet submitted) editor fixtures
  event.preventDefault();
  formattedDownload(pluginKey);
}

function onDownloadSelectChange(event: Event) {
  if (selectClicked.value) {
    (event.target as HTMLSelectElement).blur(); // trigger download
  }
}

function onDownloadSelectBlur(event: FocusEvent) {
  const target = event.target as HTMLSelectElement;
  if (target.value === '') {
    // no plugin has been selected
    return;
  }

  const pluginKey = target.value;

  // reset the select value to make it feel more like a button
  target.value = '';
  selectClicked.value = false;

  if (!props.editorFixtures) {
    // download an already submitted fixture
    window.open(`${baseLink.value}.${pluginKey}`);
    return;
  }

  // download the (possibly not yet submitted) editor fixtures
  formattedDownload(pluginKey);
}

// Fetch plugins (replaces Vue 2 fetch())
onMounted(async () => {
  if (!$axios) {
    try {
      // eslint-disable-next-line no-undef
      const nuxt = (useNuxtApp && typeof useNuxtApp === 'function') ? useNuxtApp() : undefined;
      $axios = nuxt?.$axios ?? (globalThis as any).$axios;
    } catch {
      // ignore
    }
  }
  if (!$axios) return;

  const plugins = await $axios.$get(`/api/v1/plugins`);
  exportPlugins.value = plugins.exportPlugins.map((pluginKey: string) => ({
    key: pluginKey,
    name: plugins.data[pluginKey].name,
  }));
});
</script>
