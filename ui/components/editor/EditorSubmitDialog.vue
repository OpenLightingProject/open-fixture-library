<template>
  <A11yDialog
    id="submit"
    :cancellable="false"
    :shown="state !== `closed`"
    :title="title">

    <div v-if="state === `validating`">Validating…</div>

    <div v-else-if="state === `ready`">
      <template v-if="validationIssues.length">
        The fixture validation returned some issues:

        <ul>
          <li v-for="issue in validationIssues" :key="issue.key">
            <strong>{{ issue.fixture }}:</strong> {{ issue.message }}
          </li>
        </ul>

        You can try to resolve as many issues as you can (some may be unavoidable
        in the editor) and then submit your fixture to the Open Fixture Library project.
        After submitting, we will review the fixture and fix all remaining issues.
      </template>
      <template v-else>
        The fixture validation was successful. You can now submit your fixture to the
        Open Fixture Library project, where it will be reviewed and added to the library.
        Even now, you can download your current fixture for private use.
      </template>

      <div class="button-bar right">
        <a href="#cancel" class="button secondary" @click.prevent="onCancel">Continue editing</a>
        <DownloadButton
          v-if="canDownload"
          button-style="select"
          :show-help="false"
          :editor-fixtures="fixtureCreateResult" />
        <a href="#submit" class="button primary" @click.prevent="onSubmit">Submit to OFL</a>
      </div>
    </div>

    <div v-else-if="state === `uploading`">Uploading…</div>

    <div v-else-if="state === `success`">
      Your fixture was successfully uploaded to GitHub (see the
      <a :href="pullRequestUrl" target="_blank">pull request</a>).
      It will be now reviewed and then published on the website (this may take a few days).
      Thank you for your contribution!

      <div class="button-bar right">
        <NuxtLink to="/" class="button secondary">Back to homepage</NuxtLink>
        <a
          href="/fixture-editor"
          class="button secondary"
          @click.prevent="onReset">Create another fixture</a>
        <DownloadButton
          v-if="canDownload"
          button-style="select"
          :show-help="false"
          :editor-fixtures="fixtureCreateResult" />
        <a :href="pullRequestUrl" class="button primary" target="_blank">See pull request</a>
      </div>
    </div>

    <div v-else-if="state === `error`">
      Unfortunately, there was an error while uploading. Please copy the following data and
      <a
        href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
        target="_blank">manually submit them to GitHub</a>.

      <textarea v-model="rawData" readonly />

      <div class="button-bar right">
        <a href="#cancel" class="button secondary" @click.prevent="onCancel">Close</a>
        <a
          href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
          class="button primary"
          target="_blank">Submit manually</a>
      </div>
    </div>

  </A11yDialog>
</template>

<script>
import { clone } from '../../assets/scripts/editor-utils.js';

import A11yDialog from '../A11yDialog.vue';
import DownloadButton from '../DownloadButton.vue';

const stateTitles = {
  closed: `Closed`,
  validating: `Validating your new fixture…`,
  ready: `Submit your new fixture`,
  uploading: `Submitting your new fixture…`,
  success: `Upload complete`,
  error: `Upload failed`,
};

export default {
  components: {
    A11yDialog,
    DownloadButton,
  },
  props: {
    endpoint: {
      type: String,
      required: true,
    },
    githubUsername: {
      type: String,
      required: false,
      default: null,
    },
    githubComment: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      state: `closed`,
      requestBody: null,
      error: null,
      pullRequestUrl: null,
      fixtureCreateResult: null,
    };
  },
  computed: {
    title() {
      return stateTitles[this.state];
    },
    rawData() {
      const rawData = JSON.stringify(this.requestBody, null, 2);

      if (this.state === `error`) {
        // eslint-disable-next-line quotes, prefer-template
        return '```json\n' + rawData + '\n```\n\n' + this.error;
      }

      return rawData;
    },
    canDownload() {
      // Hide the download button in case the fixture has errors. Some plugins are not able to export such fixtures.
      return process.client && !this.hasValidationErrors;
    },
    validationIssues() {
      if (this.fixtureCreateResult === null) {
        return [];
      }

      return Object.keys(this.fixtureCreateResult.fixtures).flatMap(fixture => {
        const fixtureErrors = this.fixtureCreateResult.errors[fixture] || [];
        const fixtureWarnings = this.fixtureCreateResult.warnings[fixture] || [];

        return [
          ...fixtureErrors.map((error, index) => ({
            fixture,
            message: error,
            severity: `error`,
            key: `${fixture}-error-${index}-${error}`,
          })),
          ...fixtureWarnings.map((warning, index) => ({
            fixture,
            message: warning,
            severity: `warning`,
            key: `${fixture}-warning-${index}-${warning}`,
          })),
        ];
      });
    },
    hasValidationErrors() {
      return this.validationIssues.some(message => message.severity === `error`);
    },
  },
  methods: {
    async validate(requestBody) {
      this.requestBody = requestBody;

      console.log(`validate`, clone(this.requestBody));

      this.state = `validating`;
      try {
        const response = await this.$axios.post(
          this.endpoint,
          this.requestBody,
        );

        this.fixtureCreateResult = response.data;
        this.state = `ready`;
      }
      catch (error) {
        let errorMessage = error.message;
        if (error.response && error.response.data.error) {
          errorMessage = error.response.data.error;
        }

        console.error(`There was a problem with the request:`, errorMessage);

        this.error = errorMessage;
        this.state = `error`;
      }
    },
    async onSubmit() {
      this.requestBody = {
        fixtureCreateResult: this.fixtureCreateResult,
        githubUsername: this.githubUsername,
        githubComment: this.githubComment,
      };

      console.log(`submit`, clone(this.requestBody));

      this.state = `uploading`;
      try {
        const response = await this.$axios.post(
          `/api/v1/fixtures/submit`,
          this.requestBody,
        );

        this.pullRequestUrl = response.data.pullRequestUrl;
        this.state = `success`;
        this.$emit(`success`);
      }
      catch (error) {
        let errorMessage = error.message;
        if (error.response && error.response.data.error) {
          errorMessage = error.response.data.error;
        }

        console.error(`There was a problem with the request:`, errorMessage);

        this.error = errorMessage;
        this.state = `error`;
      }
    },
    onReset() {
      this.state = `closed`;
      this.$emit(`reset`);
    },
    onCancel() {
      this.state = `closed`;
    },
  },
};
</script>
