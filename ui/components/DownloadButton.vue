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

<script>
import { booleanProp, integerProp, objectProp, oneOfProp, stringProp } from 'vue-ts-types';

export default {
  props: {
    // how many fixtures will be downloaded, if !isSingle?
    fixtureCount: integerProp().withDefault(0),
    // fixtures from the editor, not yet submitted
    editorFixtures: objectProp().optional,
    // the manufacturer key and fixture key of a submitted fixture
    fixtureKey: stringProp().optional,
    // the button style: default, 'home' or 'select'
    buttonStyle: oneOfProp([`default`, `home`, `select`]).withDefault(`default`),
    // show the help box
    showHelp: booleanProp().withDefault(false),
  },
  data() {
    return {
      exportPlugins: [],
      selectClicked: false,
    };
  },
  async fetch() {
    const plugins = await this.$axios.$get(`/api/v1/plugins`);
    this.exportPlugins = plugins.exportPlugins.map(
      pluginKey => ({
        key: pluginKey,
        name: plugins.data[pluginKey].name,
      }),
    );
  },
  computed: {
    // returns whether we're handling only one single fixture here
    // or all fixtures in a specific format
    isSingle() {
      return (this.editorFixtures && Object.keys(this.editorFixtures.fixtures).length === 1) || this.fixtureKey;
    },
    title() {
      if (this.isSingle) {
        return `Download as…`;
      }

      return `Download all ${this.fixtureCount} fixtures`;
    },
    baseLink() {
      if (this.editorFixtures) {
        return `/download-editor`;
      }

      if (this.isSingle) {
        return `/${this.fixtureKey}`;
      }

      return `/download`;
    },
  },
  methods: {
    downloadDataAsFile(blob, filename = ``) {
      if (window.navigator.msSaveBlob) {
        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
      }
      else {
        const URL = window.URL || window.webkitURL;
        const downloadUrl = URL.createObjectURL(blob);

        const anchorElement = document.createElement(`a`);

        if (anchorElement.download === undefined) {
          // non-HTML5 workaround
          window.location = downloadUrl;
        }
        else {
          anchorElement.href = downloadUrl;
          anchorElement.download = filename;
          document.body.append(anchorElement);
          anchorElement.click();
        }

        // cleanup
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
          anchorElement.remove();
        }, 100);
      }
    },
    async formattedDownload(pluginKey) {
      // download the data as a file
      // for more details, see https://stackoverflow.com/q/16086162/451391
      const response = await this.$axios.post(
        `${this.baseLink}.${pluginKey}`,
        this.editorFixtures,
        { responseType: `blob` },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      let filename = ``;
      const disposition = response.headers[`content-disposition`];
      if (disposition && disposition.includes(`attachment`)) {
        const filenameRegex = /filename[^\n;=]*=((["']).*?\2|[^\n;]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[1]) {
          filename = matches[1].replaceAll(/["']/g, ``);
        }
      }

      this.downloadDataAsFile(response.data, filename);
    },
    onDownloadButton(event, pluginKey) {
      event.target.blur();

      if (!this.editorFixtures) {
        // default link target
        return;
      }

      // download the (possibly not yet submitted) editor fixtures
      event.preventDefault();
      this.formattedDownload(pluginKey);
    },
    onDownloadSelectChange(event) {
      if (this.selectClicked) {
        event.target.blur(); // trigger download
      }
    },
    onDownloadSelectBlur(event) {
      if (event.target.value === ``) {
        // no plugin has been selected
        return;
      }

      const pluginKey = event.target.value;

      // reset the select value to make it feel more like a button
      event.target.value = ``;
      this.selectClicked = false;

      if (!this.editorFixtures) {
        // download an already submitted fixture
        window.open(`${this.baseLink}.${pluginKey}`);
        return;
      }

      // download the (possibly not yet submitted) editor fixtures
      this.formattedDownload(pluginKey);
    },
  },
};
</script>
