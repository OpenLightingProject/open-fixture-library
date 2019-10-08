<template>
  <div>
    <h1>Import fixture file</h1>

    <section class="card yellow">
      <strong>Warning:</strong> The fixture can not be edited after importing, so please provide as much information as possible in the comment.
    </section>

    <vue-form
      :state="formstate"
      action="/ajax/import-fixture-file"
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

      <div class="button-bar">
        <button type="submit" class="primary">Import fixture</button>
      </div>
    </vue-form>

    <A11yDialog
      id="submit"
      :cancellable="false"
      :shown="uploading || pullRequestUrl !== null || error !== null"
      :title="dialogTitle">

      <div v-if="uploading">Uploading…</div>

      <div v-else-if="pullRequestUrl">
        Your fixture was successfully uploaded to GitHub (see the <a :href="pullRequestUrl" target="_blank">pull request</a>). It will be now reviewed and then merged into the library. Thank you for your contribution!

        <div class="button-bar right">
          <NuxtLink to="/" class="button secondary">Back to homepage</NuxtLink>
          <a href="/import-fixture-file" class="button secondary" @click.prevent="reset">Import another fixture</a>
          <a :href="pullRequestUrl" class="button primary" target="_blank">See pull request</a>
        </div>
      </div>

      <div v-else-if="error">
        <span>Unfortunately, there was an error while uploading: {{ error }}</span>

        <div class="button-bar right">
          <NuxtLink to="/" class="button secondary">Back to homepage</NuxtLink>
          <a href="/import-fixture-file" class="button primary" @click.prevent="reset">Try again</a>
        </div>
      </div>

    </A11yDialog>
  </div>
</template>

<script>
import scrollIntoView from 'scroll-into-view';

import plugins from '../../plugins/plugins.json';

import A11yDialog from '../components/A11yDialog.vue';
import EditorFileUpload from '../components/editor/FileUpload.vue';
import LabeledInput from '../components/LabeledInput.vue';

export default {
  components: {
    A11yDialog,
    EditorFileUpload,
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
    let pullRequestUrl = query.pullRequestUrl;

    if (pullRequestUrl === `null`) {
      pullRequestUrl = null;
    }

    return {
      formstate: {},
      plugins,
      plugin: ``,
      file: null,
      comment: ``,
      author: ``,
      githubUsername: ``,
      honeypot: ``,
      pullRequestUrl: pullRequestUrl || null,
      error: query.error || null,
      uploading: false
    };
  },
  computed: {
    dialogTitle() {
      if (this.uploading) {
        return `Submitting fixture definition file…`;
      }

      if (this.pullRequestUrl) {
        return `Upload complete`;
      }

      return `Upload failed`;
    }
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

      this.uploading = true;

      const formData = new FormData(formElement);
      formData.append(`isAjax`, `true`);

      try {
        const response = await this.$axios.post(`/ajax/import-fixture-file`, formData);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        this.pullRequestUrl = response.data.pullRequestUrl;
        this.uploading = false;
        this.storePrefillData();
      }
      catch (error) {
        console.error(error);
        this.error = error.message;
        this.uploading = false;
      }
    },
    reset() {
      this.pullRequestUrl = null;
      this.error = null;
      this.uploading = false;

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
