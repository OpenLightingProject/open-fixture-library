<template>
  <div class="container" :class="{ 'only-select-button': buttonStyle === 'select' && !showHelp }">
    <!-- Display the download button as a select to make it work inside modals as well -->
    <select
      v-if="buttonStyle === 'select'"
      @click="selectClicked = true"
      @keyup.enter="($event.target as HTMLSelectElement).blur()"
      @change="onDownloadSelectChange($event)"
      @blur="onDownloadSelectBlur($event)">
      <option value="" disabled selected>{{ title }}</option>
      <option v-for="plugin of exportPlugins" :key="plugin.key" :value="plugin.key">{{ plugin.name }}</option>
    </select>

    <!-- Display the download button as hoverable div with real links in the dropdown -->
    <div
      v-else
      class="download-button"
      :class="{ home: buttonStyle === 'home' }">
      <a href="#" class="title" @click.prevent>{{ title }}</a>
      <ul>
        <li v-for="plugin of exportPlugins" :key="plugin.key">
          <a
            :href="`${baseLink}.${plugin.key}`"
            :title="`Download ${plugin.name} fixture definition${isSingle ? '' : 's'}`"
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
      :target="buttonStyle === 'home' ? undefined : '_blank'"
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
interface EditorFixtures {
  fixtures: Record<string, unknown>;
}

interface Plugin {
  key: string;
  name: string;
}

interface Props {
  fixtureCount?: number;
  editorFixtures?: EditorFixtures;
  fixtureKey?: string;
  buttonStyle?: 'default' | 'home' | 'select';
  showHelp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fixtureCount: 0,
  buttonStyle: 'default',
  showHelp: false,
});

const { data: pluginsData } = await useFetch('/api/v1/plugins');

const exportPlugins = computed<Plugin[]>(() => {
  if (!pluginsData.value) return [];
  return pluginsData.value.exportPlugins.map(
    pluginKey => ({
      key: pluginKey,
      name: pluginsData.value!.data[pluginKey].name,
    }),
  );
});

const selectClicked = ref(false);

const isSingle = computed(() => {
  return (props.editorFixtures && Object.keys(props.editorFixtures.fixtures).length === 1) || props.fixtureKey;
});

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

function downloadDataAsFile(blob: Blob, filename = '') {
  const URL = window.URL || window.webkitURL;
  const downloadUrl = URL.createObjectURL(blob);

  const anchorElement = document.createElement('a');

  if (anchorElement.download === undefined) {
    window.location = downloadUrl;
  }
  else {
    anchorElement.href = downloadUrl;
    anchorElement.download = filename;
    document.body.append(anchorElement);
    anchorElement.click();
  }

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
    anchorElement.remove();
  }, 100);
}

async function formattedDownload(pluginKey: string) {
  const response = await $fetch<Blob>(`${baseLink.value}.${pluginKey}`, {
    method: 'POST',
    body: props.editorFixtures,
    responseType: 'blob',
  });

  downloadDataAsFile(response, '');
}

function onDownloadButton(event: MouseEvent, pluginKey: string) {
  (event.target as HTMLElement).blur();

  if (!props.editorFixtures) {
    return;
  }

  event.preventDefault();
  formattedDownload(pluginKey);
}

function onDownloadSelectChange(event: Event) {
  if (selectClicked.value) {
    (event.target as HTMLSelectElement).blur();
  }
}

function onDownloadSelectBlur(event: FocusEvent) {
  const target = event.target as HTMLSelectElement;
  if (target.value === '') {
    return;
  }

  const pluginKey = target.value;
  target.value = '';
  selectClicked.value = false;

  if (!props.editorFixtures) {
    window.open(`${baseLink.value}.${pluginKey}`);
    return;
  }

  formattedDownload(pluginKey);
}
</script>
