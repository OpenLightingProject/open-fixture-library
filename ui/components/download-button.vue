<template>
  <div class="container">
    <div :class="{ 'download-button': true, 'big': isStyleBig, 'home': isStyleHome }">
      <a
         href="#"
         :class="{ 'button secondary': !isStyleBig && !isStyleHome, title: isStyleBig || isStyleHome }"
         @click.prevent>{{ title }}</a>
      <ul>
        <li v-for="plugin in exportPlugins" :key="plugin.key">
          <a
            :title="`Download ${plugin.name} fixture definition${isSingle ? `` : `s`}`"
            rel="nofollow"
            @click="onDownload(plugin.key); blur($event)">
            {{ plugin.name }}
          </a>
        </li>
      </ul>
    </div>

    <nuxt-link
      v-if="help"
      to="/about/plugins"
      :target="isStyleHome ? null : `_blank`"
      class="help-link">
      <app-svg name="help-circle-outline" /><span class="name">Download instructions</span>
    </nuxt-link>
  </div>
</template>

<style lang="scss" scoped>
.container {
  text-align: center;
  margin: 0 0 1em;
  display: inline-block;

  @media (min-width: 650px) {
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
</style>

<style lang="scss">
.download-button {
  text-align: left;

  & > .title {
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 0.5ex 2ex;
    border-radius: 2px;
    font-weight: 600;
    cursor: pointer;
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
    display: none;
    position: absolute;
    padding: 0.7em 0;
    margin: 0;
    list-style: none;
    background-color: $grey-50;
    border-radius: 0 0 2px 2px;
    box-shadow: 0 2px 2px rgba(#000, 0.2);
    z-index: 2000;

    & a {
      display: block;
      padding: 0.2ex 2ex;
      color: $primary-text-dark;
      transition: background-color 0.2s;
      cursor: pointer;
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
    display: block;
  }

  &:focus-within > ul {
    display: block;
  }
}

.download-button.big {
  & > .title {
    background: $orange-500;
    font-weight: 600;
    color: $primary-text-light;
    box-shadow: 0 2px 2px rgba(#000, 0.2);
    transition: border-radius 0.2s, background-color 0.2s;
  }

  & > ul {
    width: 100%;
  }

  &:hover > .title,
  & > .title:focus,
  & > .title:active {
    border-radius: 2px 2px 0 0;
    background: $orange-700;
  }

  &:hover > ul,
  & > .title:focus + ul,
  & > .title:active + ul {
    display: block;
  }

  /* single rule since unsupporting browsers skip the whole rule */
  &:focus-within > .title {
    border-radius: 2px 2px 0 0;
    background: $orange-700;
  }
}

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
    // download a single fixture or all of a plugin?
    isSingle: {
      type: Boolean,
      required: false,
      default: true
    },
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
    submittedFixtureManKeyAndKey: {
      type: String,
      required: false,
      default: undefined
    },
    // the button style: default, 'big' or 'home'
    buttonStyle: {
      type: String,
      required: false,
      default: undefined
    },
    // show the help box
    help: {
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
    title() {
      if (this.isSingle) {
        return `Download as…`;
      }

      return `Download all ${this.fixtureCount} fixtures`;
    },
    isStyleHome() {
      return this.buttonStyle === `home`;
    },
    isStyleBig() {
      return this.buttonStyle === `big` || this.isStyleHome;
    }
  },
  methods: {
    blur(event) {
      event.target.blur();
    },
    downloadDataAsFile(data, filename, type) {
      const blob = typeof File === `function`
        ? new File([data], filename, { type: type })
        : new Blob([data], { type: type });

      if (typeof window.navigator.msSaveBlob !== `undefined`) {
        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
      }
      else {
        const URL = window.URL || window.webkitURL;
        const downloadUrl = URL.createObjectURL(blob);

        if (filename) {
          // use HTML5 a[download] attribute to specify filename
          const a = document.createElement(`a`);

          // safari doesn't support this in older versions
          if (typeof a.download === `undefined`) {
            window.location = downloadUrl;
          }
          else {
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
          }
        }
        else {
          window.location = downloadUrl;
        }

        // cleanup
        setTimeout(() =>  {
          URL.revokeObjectURL(downloadUrl);
        }, 100);
      }
    },
    async onDownload(plugin) {
      if (this.editorFixtures) {
        // download the not yet submitted editor fixtures

        // download the data as a file. see the following link for more details:
        // https://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
        const response = await this.$axios.post(
          `/download-editor.${plugin}`,
          this.editorFixtures
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        let filename = ``;
        const disposition = response.headers[`content-disposition`];
        if (disposition && disposition.indexOf(`attachment`) !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        const type = response.headers[`content-type`];

        this.downloadDataAsFile(response.data, filename, type);
      }
      else if (this.isSingle) {
        // download a single fixture
        window.open(`/${this.submittedFixtureManKeyAndKey}.${plugin}`);
      }
      else {
        // download all fixture in a specific format
        window.open(`/download.${plugin}`);
      }
    }
  }
};
</script>
