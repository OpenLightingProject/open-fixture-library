<template>
  <div class="container" :class="{ 'only-select-button': buttonStyle === `select` && !showHelp }">
    <!-- Display the download button as a select to make it work inside modals as well -->
    <select
      v-if="buttonStyle === `select`"
      @change="onDownloadSelect($event)">
      <option value="" disabled selected>{{ title }}</option>
      <option v-for="plugin in exportPlugins" :key="plugin.key" :value="plugin.key">{{ plugin.name }}</option>
    </select>

    <!-- Display the download button as hoverable div with real links in the dropdown -->
    <div
      v-else
      class="download-button"
      :class="{ home: buttonStyle === `home` }">
      <a href="#" class="title" @click.prevent>{{ title }}</a>
      <ul>
        <li v-for="plugin in exportPlugins" :key="plugin.key">
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

    <nuxt-link
      v-if="showHelp"
      to="/about/plugins"
      :target="buttonStyle === `home` ? null : `_blank`"
      class="help-link">
      <app-svg name="help-circle-outline" /><span class="name">Download instructions</span>
    </nuxt-link>
  </div>
</template>

<style lang="scss" scoped>
.container {
  text-align: center;
  margin: 0 0 1em;

  @media (min-width: 650px) {
    margin: 0;
  }

  &.only-select-button {
    display: inline-block;
    margin: 0;
  }
}

.help-link {
  display: inline-block;
  color: $secondary-text-dark;
  font-size: 0.9rem;
  line-height: 1.2;
  transition: opacity 0.15s;
  margin-left: -1ex;

  .icon {
    width: 1.2rem;
    height: 1.2rem;
    fill: $secondary-text-dark;
  }

  .name {
    vertical-align: middle;
    margin-left: 0.5ex;
  }

  &:hover,
  &:focus {
    opacity: 0.7;
  }
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  display: inline-block;
  box-sizing: content-box;
  line-height: 1.4;
  height: 1.4em;
  width: 12.5ex;
  margin-left: 1ex;
  margin-top: 1ex;
  padding: 0.5em 3ex;

  background: $grey-50;

  color: $secondary-text-dark;
  font-weight: 600;
  font-size: 0.9em;

  border-color: $grey-300;
  border-radius: 2px;

  transition: 0.1s background-color;
  cursor: pointer;

  &:not(:disabled):hover,
  &:not(:disabled):focus {
    background-color: $grey-300;
  }
}

.download-button {
  text-align: left;

  & > .title {
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 0.5ex 2ex;
    border-radius: 2px;
    background: $orange-500;
    font-weight: 600;
    color: $primary-text-light;
    cursor: pointer;
    box-shadow: 0 2px 2px rgba(#000, 0.2);
    transition: border-radius 0.2s, background-color 0.2s;

    /* down arrow */
    &::before {
      content: '';
      display: block;
      width: 0;
      height: 0;
      border-width: 0.4em 0.4em 0;
      border-style: solid;
      border-color: currentcolor transparent transparent;
      float: right;
      margin: 0.8em 0 0 1ex;
    }
  }

  & > ul {
    position: absolute;
    // just move the list to the left outside of the screen but don't hide it,
    // to still allow screenreaders reading it
    left: -9999px;
    top: 100%;
    padding: 0.7em 0;
    margin: 0;
    width: 100%;
    list-style: none;
    background-color: $grey-50;
    border-radius: 0 0 2px 2px;
    box-shadow: 0 2px 2px rgba(#000, 0.2);
    z-index: 90;

    & a {
      display: block;
      padding: 0.2ex 2ex;
      color: $primary-text-dark;
      transition: background-color 0.2s;
    }

    & a:hover,
    & a:focus {
      background-color: $grey-200;
      outline: 0;
    }
  }

  &:hover > ul,
  & > .title:focus + ul,
  & > .title:active + ul {
    left: 0;
  }

  /* separate rule since unsupporting browsers skip the whole rule */
  &:focus-within > ul {
    left: 0;
  }


  &:hover > .title,
  & > .title:focus,
  & > .title:active {
    border-radius: 2px 2px 0 0;
    background: $orange-700;
  }

  &:focus-within > .title {
    border-radius: 2px 2px 0 0;
    background: $orange-700;
  }
}
</style>

<style lang="scss">
.fixture-header .download-button {
  display: block;
  position: relative;
}

/* move download button to the right */
@media (min-width: 650px) {
  .fixture-header {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: row;
    flex-direction: row;
    align-items: baseline;

    & > .title {
      -ms-flex: 1 1 auto;
      flex-grow: 1;
      flex-shrink: 1;
    }

    & .download-button {
      -ms-flex: 0 0 auto;
      flex-grow: 0;
      flex-shrink: 0;
      margin: 1.5rem 0 0;
      width: 14em;

      &.home {
        width: 19em;

        & .title {
          font-size: 1.1em;
        }
      }
    }
  }
}
</style>

<script>
import plugins from '~~/plugins/plugins.json';

import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-svg': svgVue
  },
  props: {
    // how many fixtures will be downloaded, if !isSingle?
    fixtureCount: {
      type: Number,
      required: false,
      default: 0
    },
    // a fixture from the editor, not yet submitted
    editorFixtures: {
      type: Object,
      required: false,
      default: undefined
    },
    // the manufacturer key and fixture key of a submitted fixture
    fixtureKey: {
      type: String,
      required: false,
      default: undefined
    },
    // the button style: default, 'home' or 'select'
    buttonStyle: {
      type: String,
      required: false,
      default: `default`,
      validate(buttonStyle) {
        return [`default`, `home`, `select`].includes(buttonStyle);
      }
    },
    // show the help box
    showHelp: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      exportPlugins: plugins.exportPlugins.map(
        pluginKey => ({
          key: pluginKey,
          name: plugins.data[pluginKey].name
        })
      )
    };
  },
  computed: {
    // returns whether we're handling only one single fixture here
    // or all fixtures in a specific format
    isSingle() {
      return (this.editorFixtures && this.editorFixtures.fixtures.length === 1) || this.fixtureKey;
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
    }
  },
  methods: {
    downloadDataAsFile(blob, filename = ``) {
      if (window.navigator.msSaveBlob !== undefined) {
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
          document.body.appendChild(anchorElement);
          anchorElement.click();
        }

        // cleanup
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(anchorElement);
        }, 100);
      }
    },
    async formattedDownload(pluginKey) {
      // download the data as a file
      // for more details, see https://stackoverflow.com/q/16086162/451391
      const response = await this.$axios.post(
        `${this.baseLink}.${pluginKey}`,
        this.editorFixtures,
        { responseType: `blob` }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      let filename = ``;
      const disposition = response.headers[`content-disposition`];
      if (disposition && disposition.includes(`attachment`)) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, ``);
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
    onDownloadSelect(event) {
      if (event.target.value === ``) {
        // no plugin has been selected
        return;
      }

      const pluginKey = event.target.value;

      // reset the select value to make it feel more like a button
      event.target.value = ``;

      if (!this.editorFixtures) {
        // download an already submitted fixture
        window.open(`${this.baseLink}.${pluginKey}`);
        return;
      }

      // download the (possibly not yet submitted) editor fixtures
      this.formattedDownload(pluginKey);
    }
  }
};
</script>
