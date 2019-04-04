<template>
  <app-a11y-dialog
    id="submit"
    :cancellable="false"
    :shown="submit.state !== `closed`"
    :title="title">

    <a
      ref="downloadAnchorElement"
      :href="downloadFileUrl"
      :download="downloadFileName"
      hidden />

    <div v-if="submit.state === `validating`">Validating…</div>

    <div v-if="submit.state === `loading`">Uploading…</div>

    <div v-else-if="submit.state === `ready`">
      <template v-if="validationErrors.length || validationWarnings.length">
        The fixture validation returned some remarks:

        <ul>
          <li v-for="message in validationErrors" :key="message">{{ message }}</li>
          <li v-for="message in validationWarnings" :key="message">{{ message }}</li>
        </ul>

        You can try to resolve them or continue anyway with submitting your fixture
        to the Open Fixture Library project (then we will fix those issues).
        You can also only download the fixture for private use.
      </template>
      <template v-else>
        The fixture validation was successful. You can now submit your fixture to
        the Open Fixture Library project or only download it for private use.
      </template>

      <div class="button-bar right">
        <a class="button secondary" @click.prevent="onCancel">Continue editing</a>
        <app-download-button :help="false" :editor-fixtures="submit.sendObject" />
        <a class="button primary" @click.prevent="onSubmit">Submit to OFL</a>
      </div>
    </div>

    <div v-else-if="submit.state === `success`">
      Your fixture was successfully uploaded to GitHub (see the
      <a :href="pullRequestUrl" target="_blank">pull request</a>).
      It will be now reviewed and then published on the website (this may take a few days).
      Thank you for your contribution!

      <div class="button-bar right">
        <nuxt-link to="/" class="button secondary">Back to homepage</nuxt-link>
        <a
          href="/fixture-editor"
          class="button secondary"
          @click.prevent="$emit(`reset`)">Create another fixture</a>
        <a class="button secondary" @click.prevent="onDownload">Download</a>
        <a :href="pullRequestUrl" class="button primary" target="_blank">See pull request</a>
      </div>
    </div>

    <div v-else-if="submit.state === `error`">
      Unfortunately, there was an error while uploading. Please copy the following data and
      <a
        href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
        target="_blank">manually submit them to GitHub</a>.

      <textarea v-model="rawData" readonly />

      <div class="button-bar right">
        <a class="button secondary" @click.prevent="onCancel">Close</a>
        <a
          href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
          class="button primary"
          target="_blank">Submit manually</a>
      </div>
    </div>

  </app-a11y-dialog>
</template>

<style lang="scss">
#submit-dialog {
  // used for the download button to be able to show
  // the drop down over the dialog
  overflow: unset;
}
</style>

<script>
import a11yDialogVue from '~/components/a11y-dialog.vue';
import downloadButtonVue from '~/components/download-button.vue';
import { clone } from '~/assets/scripts/editor-utils.mjs';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue,
    'app-download-button': downloadButtonVue
  },
  props: {
    submit: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      error: null,
      pullRequestUrl: null,
      downloadFileName: null,
      downloadFileUrl: null,
      validationErrors: [],
      validationWarnings: [],
      fixtureJson: null
    };
  },
  computed: {
    title() {
      if (this.submit.state === `ready`) {
        return `Submit your new fixture`;
      }

      if (this.submit.state === `validating`) {
        return `Validating your new fixture…`;
      }

      if (this.submit.state === `loading`) {
        return `Submitting your new fixture…`;
      }

      if (this.submit.state === `success`) {
        return `Upload complete`;
      }

      return `Upload failed`;
    },
    rawData() {
      const rawData = JSON.stringify(this.submit.sendObject, null, 2);

      if (this.submit.state === `error`) {
        // eslint-disable-next-line quotes, prefer-template
        return '```json\n' + rawData + '\n```\n\n' + this.error;
      }

      return rawData;
    }
  },
  watch: {
    'submit.state': function(newState) {
      if (newState === `validate`) {
        this.$nextTick(this.onValidate);
      }
    }
  },
  methods: {
    async onValidate() {
      console.log(`validate`, clone(this.submit.sendObject));

      this.submit.state = `validating`;
      try {
        const response = await this.$axios.post(
          `/ajax/submit-editor`,
          this.submit.sendObject
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        this.downloadFileName = `${response.data.fixtureKey}.json`;
        this.downloadFileUrl = `data:application/json;charset=utf-8,${encodeURIComponent(response.data.fixtureJson)}`;
        this.validationErrors = response.data.errors;
        this.validationWarnings = response.data.warnings;
        this.submit.state = `ready`;
      }
      catch (error) {
        console.error(`There was a problem with the request.`, error);

        this.error = error.message;
        this.submit.state = `error`;
      }
    },
    async onSubmit() {
      this.submit.sendObject.createPullRequest = true;
      console.log(`submit`, clone(this.submit.sendObject));

      this.submit.state = `loading`;
      try {
        const response = await this.$axios.post(
          `/ajax/submit-editor`,
          this.submit.sendObject
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        this.pullRequestUrl = response.data.pullRequestUrl;
        this.submit.state = `success`;
        this.$emit(`success`);
      }
      catch (error) {
        console.error(`There was a problem with the request.`, error);

        this.error = error.message;
        this.submit.state = `error`;
      }
    },
    onCancel() {
      this.submit.state = `closed`;
    }
  }
};
</script>
