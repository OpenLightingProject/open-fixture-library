<template>
  <div>
    <h1>Import fixture file</h1>

    <section class="card yellow">
      <strong>Warning:</strong> The fixture can not be edited after importing, so please provide as much information as possible in the comment.
    </section>

    <VueForm
      :state="formstate"
      action="/api/import-fixture-file"
      method="post"
      enctype="multipart/form-data"
      @submit.prevent="onSubmit($event.target)">

      <section class="card">
        <h2>File information</h2>

        <LabeledInput :formstate="formstate" name="plugin" label="Import file type">
          <select
            v-model="plugin"
            :class="{ empty: plugin === `` }"
            required
            name="plugin">

            <option value="" disabled>Please select an import file type</option>

            <template v-for="pluginKey in plugins.importPlugins">
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
          hint="Maximum file size is 5MB.">
          <EditorFileUpload
            ref="fileUpload"
            v-model="file"
            :required="true"
            name="file"
            max-file-size="5MB" />
        </LabeledInput>

        <LabeledInput :formstate="formstate" name="comment" label="Comment">
          <textarea v-model="comment" name="comment" />
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
      endpoint="/api/import-fixture-file"
      :query-parameters="queryParameters"
      @success="storePrefillData"
      @reset="reset" />
  </div>
</template>

<script>
import scrollIntoView from 'scroll-into-view';

import plugins from '../../plugins/plugins.json';

import EditorFileUpload from '../components/editor/EditorFileUpload.vue';
import EditorSubmitDialog from '../components/editor/EditorSubmitDialog.vue';
import LabeledInput from '../components/LabeledInput.vue';

export default {
  components: {
    EditorFileUpload,
    EditorSubmitDialog,
    LabeledInput
  },
  head() {
    const title = `Import fixture`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title
        }
      ]
    };
  },
  asyncData({ query }) {
    return {
      formstate: {},
      plugins,
      plugin: ``,
      file: null,
      comment: ``,
      author: ``,
      githubUsername: ``,
      honeypot: ``,
      queryParameters: query
    };
  },
  mounted() {
    this.applyStoredPrefillData();
  },
  methods: {
    async onSubmit(formElement) {
      if (this.formstate.$invalid) {
        const field = document.querySelector(`.vf-field-invalid`);

        scrollIntoView(field, {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100
          },
          isScrollable: target => target === window
        }, () => field.focus());

        return;
      }

      if (this.honeypot !== ``) {
        alert(`Do not fill the "Ignore" fields!`);
        return;
      }

      if (!(`FormData` in window)) {
        // submit manually (with page reloading)
        formElement.submit();
        return;
      }

      // submit via AJAX

      const sendObject = new FormData(formElement);
      sendObject.append(`isAjax`, `true`);

      this.$refs.submitDialog.validate(sendObject);
    },
    reset() {
      this.plugin = ``;
      this.$refs.fileUpload.clear();

      // clear query
      this.$router.push({
        path: this.$route.path,
        query: {}
      });

      this.$nextTick(() => {
        this.formstate._reset();
      });
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
    }
  }
};
</script>
