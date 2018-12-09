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

        <app-labeled-input :formstate="formstate" name="plugin" label="Import file type">
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
        </app-labeled-input>

        <app-labeled-input
          :formstate="formstate"
          name="file"
          label="Fixture definition file"
          hint="Maximum file size is 5MB.">
          <app-editor-file-upload
            v-model="file"
            :required="true"
            name="file"
            max-file-size="5MB" />
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="comment" label="Comment">
          <textarea v-model="comment" name="comment" />
        </app-labeled-input>
      </section>

      <section class="user card">
        <h2>Author data</h2>

        <app-labeled-input :formstate="formstate" name="author" label="Your name">
          <input
            v-model="author"
            type="text"
            required
            name="author"
            placeholder="e.g. Anonymous">
        </app-labeled-input>

        <app-labeled-input
          :formstate="formstate"
          name="githubUsername"
          label="GitHub username"
          hint="If you want to be mentioned in the pull request.">
          <input
            v-model="githubUsername"
            type="text"
            name="githubUsername">
        </app-labeled-input>

        <app-labeled-input hidden name="honeypot" label="Ignore this!">
          <input v-model="honeypot" type="text" name="honeypot">
          <div class="hint">Spammers are likely to fill this field. Leave it empty to show that you're a human.</div>
        </app-labeled-input>
      </section>

      <div class="button-bar">
        <button type="submit" class="primary">Import fixture</button>
      </div>
    </vue-form>

    <app-a11y-dialog
      id="submit"
      :cancellable="false"
      :shown="uploading || pullRequestUrl !== null || error !== null"
      :title="dialogTitle">

      <div v-if="uploading">Uploading…</div>

      <div v-else-if="pullRequestUrl">
        Your fixture was successfully uploaded to GitHub (see the <a :href="pullRequestUrl" target="_blank">pull request</a>). It will be now reviewed and then merged into the library. Thank you for your contribution!

        <div class="button-bar right">
          <nuxt-link to="/" class="button secondary">Back to homepage</nuxt-link>
          <a href="/import-fixture-file" class="button secondary" @click.prevent="reset">Import another fixture</a>
          <a :href="pullRequestUrl" class="button primary" target="_blank">See pull request</a>
        </div>
      </div>

      <div v-else-if="error">
        <span>Unfortunately, there was an error while uploading: {{ error }}</span>

        <div class="button-bar right">
          <nuxt-link to="/" class="button secondary">Back to homepage</nuxt-link>
          <a href="/import-fixture-file" class="button primary" @click.prevent="reset">Try again</a>
        </div>
      </div>

    </app-a11y-dialog>
  </div>
</template>

<script>
import scrollIntoView from 'scroll-into-view';

import plugins from '~~/plugins/plugins.json';

import a11yDialogVue from '~/components/a11y-dialog.vue';
import editorFileUploadVue from '~/components/editor-file-upload.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue,
    'app-editor-file-upload': editorFileUploadVue,
    'app-labeled-input': labeledInputVue
  },
  head() {
    return {
      title: `Import fixture`
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
    }
  }
};
</script>
