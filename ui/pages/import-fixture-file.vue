<template>
  <div>
    <h1>Import fixture file</h1>

    <section class="card yellow">
      <strong>Warning:</strong> The fixture can not be edited after importing, so please provide as much information as possible in the comment.
    </section>

    <noscript class="card yellow">
      Please enable JavaScript to use the Fixture Importer!
    </noscript>

    <ClientOnly placeholder="Fixture Importer is loading...">

      <VueForm
        :state="formstate"
        action="#"
        class="only-js"
        @submit.prevent="onSubmit()">

        <section class="card">
          <h2>File information</h2>

          <LabeledInput :formstate="formstate" name="plugin" label="Import file type">
            <select
              v-model="plugin"
              :class="{ empty: plugin === `` }"
              required
              name="plugin">

              <option value="" disabled>Please select an import file type</option>

              <template v-for="pluginKey of plugins.importPlugins">
                <option :key="pluginKey" :value="pluginKey">
                  {{ plugins.data[pluginKey].name }}
                </option>
              </template>

            </select>

            <div class="hint">See <a href="/about/plugins" target="_blank">supported import plugins</a>.</div>
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="file"
            label="Fixture definition file"
            hint="Maximum file size is 50MB.">
            <EditorFileUpload
              v-model="file"
              required
              name="file"
              max-file-size="50MB" />
          </LabeledInput>

          <LabeledInput :formstate="formstate" name="githubComment" label="Comment">
            <textarea v-model="githubComment" name="githubComment" />
          </LabeledInput>
        </section>

        <section class="user card">
          <h2>Author data</h2>

          <LabeledInput :formstate="formstate" name="author" label="Your name">
            <input
              v-model="author"
              type="text"
              required
              name="author"
              placeholder="e.g. Anonymous">
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="githubUsername"
            label="GitHub username"
            hint="If you want to be mentioned in the pull request.">
            <input
              v-model="githubUsername"
              type="text"
              name="githubUsername">
          </LabeledInput>

          <LabeledInput hidden name="honeypot" label="Ignore this!">
            <input v-model="honeypot" type="text" name="honeypot">
            <div class="hint">Spammers are likely to fill this field. Leave it empty to show that you're a human.</div>
          </LabeledInput>
        </section>

        <div class="button-bar right">
          <button type="submit" class="primary">Import fixture</button>
        </div>
      </VueForm>

      <EditorSubmitDialog
        ref="submitDialog"
        endpoint="/api/v1/fixtures/import"
        :github-username="githubUsername"
        :github-comment="githubComment"
        @success="storePrefillData()"
        @reset="reset()" />

    </ClientOnly>
  </div>
</template>

<script>
import scrollIntoView from 'scroll-into-view';

import { getEmptyFormState } from '../assets/scripts/editor-utilities.js';
import EditorFileUpload from '../components/editor/EditorFileUpload.vue';
import EditorSubmitDialog from '../components/editor/EditorSubmitDialog.vue';
import LabeledInput from '../components/LabeledInput.vue';

export default {
  components: {
    EditorFileUpload,
    EditorSubmitDialog,
    LabeledInput,
  },
  async asyncData({ $axios, error }) {
    let plugins;
    try {
      plugins = await $axios.$get(`/api/v1/plugins`);
    }
    catch (requestError) {
      return error(requestError);
    }
    return { plugins };
  },
  data() {
    return {
      formstate: getEmptyFormState(),
      plugin: ``,
      file: undefined,
      githubComment: ``,
      author: ``,
      githubUsername: ``,
      honeypot: ``,
    };
  },
  head() {
    const title = `Import fixture`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title,
        },
      ],
    };
  },
  mounted() {
    this.applyStoredPrefillData();
  },
  methods: {
    async onSubmit() {
      if (this.formstate.$invalid) {
        const field = document.querySelector(`.vf-field-invalid`);

        scrollIntoView(field, {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100,
          },
          isScrollable: target => target === window,
        }, () => field.focus());

        return;
      }

      if (this.honeypot !== ``) {
        alert(`Do not fill the "Ignore" fields!`);
        return;
      }

      try {
        const fileDataUrl = await getFileDataUrl(this.file);
        const [, fileContentBase64] = fileDataUrl.match(/base64,(.+)$/);

        this.$refs.submitDialog.validate({
          plugin: this.plugin,
          fileName: this.file.name,
          fileContentBase64,
          author: this.author,
        });
      }
      catch (fileReaderError) {
        alert(`Could not read the file.`);
        console.error(`Could not read the file.`, fileReaderError);
      }

      /**
       * @param {File} file A File object from an HTML5 file input.
       * @returns {Promise<string>} Resolves with the file contents as dataURL string.
       */
      function getFileDataUrl(file) {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();

          fileReader.addEventListener(`load`, () => {
            resolve(fileReader.result);
          });
          fileReader.addEventListener(`error`, reject);
          fileReader.addEventListener(`abort`, reject);

          fileReader.readAsDataURL(file);
        });
      }
    },
    async reset() {
      this.file = undefined;
      this.githubComment = ``;

      await this.$nextTick();
      this.formstate._reset();
    },
    applyStoredPrefillData() {
      if (!localStorage) {
        return;
      }

      if (this.author === ``) {
        this.author = localStorage.getItem(`prefillAuthor`) || ``;
      }

      if (this.githubUsername === ``) {
        this.githubUsername = localStorage.getItem(`prefillGithubUsername`) || ``;
      }
    },
    storePrefillData() {
      localStorage.setItem(`prefillAuthor`, this.author);
      localStorage.setItem(`prefillGithubUsername`, this.githubUsername);
    },
  },
};
</script>
