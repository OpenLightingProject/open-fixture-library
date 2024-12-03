<template>
  <A11yDialog
    id="submit-dialog"
    is-alert-dialog
    :shown="state !== `closed`"
    :title="title"
    :wide="state === `preview`">

    <template v-if="state === `preview`" #title>
      <span class="preview-fixture-title">{{ title }}</span>
      <select
        v-if="fixtureKeys.length > 1"
        v-model="previewFixtureKey"
        class="preview-fixture-chooser">
        <option disabled>Choose fixture to preview</option>
        <option
          v-for="key of fixtureKeys"
          :key="key"
          :value="key">{{ key }}</option>
      </select>
    </template>

    <div v-if="state === `validating`">Validating…</div>

    <div v-else-if="state === `ready`">
      <template v-if="!hasPreview">
        Unfortunately, the fixture validation returned some issues.
        Due to some of those, there is also no preview available.
        You can try to resolve as many errors as you can (some may be unavoidable in the editor)
        and then submit your fixture{{ isPlural ? `s` : `` }} to the Open Fixture Library project.
        After submitting, we will review the fixture{{ isPlural ? `s` : `` }} and fix all remaining issues.
      </template>
      <template v-else-if="hasValidationErrors || hasValidationWarnings">
        Unfortunately, the fixture validation returned some issues.
        You can try to resolve as many as you can (some may be unavoidable in the editor).
        Next, head over to the preview, where it is also possible to download
        your current fixture{{ isPlural ? `s` : `` }} for private use.
        After that, please submit your fixture{{ isPlural ? `s` : `` }} to the Open Fixture Library project,
        where {{ isPlural ? `they` : `it` }} will be reviewed and added to the library.
      </template>
      <template v-else>
        Your fixture validation was successful.
        Next, head over to the preview, where it is also possible to download
        your current fixture{{ isPlural ? `s` : `` }} for private use.
        After that, please submit your fixture{{ isPlural ? `s` : `` }} to the Open Fixture Library project,
        where {{ isPlural ? `they` : `it` }} will be reviewed and added to the library.
      </template>

      <ul>
        <li v-for="key of fixtureKeys" :key="key">
          <strong>{{ key }}</strong>
          <ul>
            <li v-for="message of fixtureCreateResult.errors[key]" :key="message">
              Error: {{ message }}
            </li>
            <li v-for="message of fixtureCreateResult.warnings[key]" :key="message">
              {{ message }}
            </li>
          </ul>
        </li>
      </ul>

      <div class="button-bar right">
        <button type="button" class="secondary" @click.prevent="onCancel()">Continue editing</button>
        <button
          v-if="hasPreview"
          type="button"
          class="primary"
          @click.prevent="onPreview()">Preview fixture{{ isPlural ? `s` : `` }}</button>
        <button
          v-else
          type="button"
          class="primary"
          @click.prevent="onSubmit()">Submit to OFL</button>
      </div>
    </div>

    <div v-else-if="state === `preview`">
      <div v-if="previewFixture" class="fixture-page">
        <FixtureHeader>
          <template #title>
            <h1>
              {{ previewFixture.manufacturer.name }} {{ previewFixture.name }}
              <code v-if="previewFixture.hasShortName">{{ previewFixture.shortName }}</code>
            </h1>
          </template>

          <DownloadButton
            v-if="previewFixtureResults.errors.length === 0"
            :editor-fixtures="previewFixtureCreateResult" />
        </FixtureHeader>

        <section v-if="previewFixtureResults.warnings.length > 0" class="card yellow">
          <strong>Warnings:<br></strong>
          <span v-for="message of previewFixtureResults.warnings" :key="message">
            {{ message }}<br>
          </span>
        </section>

        <section v-if="previewFixtureResults.errors.length > 0" class="card red">
          <strong>Errors (prevent showing the fixture preview):<br></strong>
          <span v-for="message of previewFixtureResults.errors" :key="message">
            {{ message }}<br>
          </span>
        </section>

        <FixturePage
          v-if="previewFixtureResults.errors.length === 0"
          :fixture="previewFixture" />
      </div>

      <div class="button-bar right">
        <button type="button" class="secondary" @click.prevent="onCancel()">Continue editing</button>
        <button type="button" class="primary" @click.prevent="onSubmit()">Submit to OFL</button>
      </div>
    </div>

    <div v-else-if="state === `uploading`">Uploading…</div>

    <div v-else-if="state === `success`">
      Your fixture was successfully uploaded to GitHub (see the
      <a :href="pullRequestUrl" target="_blank" rel="noopener">pull request</a>).
      It will be now reviewed and then published on the website (this may take a few days).
      Thank you for your contribution!

      <div class="button-bar right">
        <NuxtLink to="/" class="button secondary">Back to homepage</NuxtLink>
        <button type="button" class="button secondary" @click.prevent="onReset()">Close</button>
        <DownloadButton
          v-if="!hasValidationErrors"
          button-style="select"
          :editor-fixtures="fixtureCreateResult" />
        <a
          :href="pullRequestUrl"
          class="button primary"
          target="_blank"
          rel="noopener">
          See pull request
        </a>
      </div>
    </div>

    <div v-else-if="state === `error`">
      Unfortunately, there was an error while uploading. Please copy the following data and
      <a
        href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
        target="_blank"
        rel="noopener">
        manually submit them to GitHub
      </a>.

      <textarea v-model="rawData" readonly />

      <div class="button-bar right">
        <button type="button" class="button secondary" @click.prevent="onCancel()">Close</button>
        <a
          href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
          class="button primary"
          target="_blank"
          rel="noopener">
          Submit manually
        </a>
      </div>
    </div>

  </A11yDialog>
</template>

<style lang="scss" scoped>
.preview-fixture-title {
  margin-right: 1ex;
}

.preview-fixture-chooser {
  width: 350px;
  font-size: 1rem;
  vertical-align: middle;
}

.fixture-page {
  padding: 0.1rem 1rem 1rem;
  margin: 1rem -1rem -1rem;
  background: theme-color(page-background);

  & ::v-deep .help-wanted .actions {
    cursor: not-allowed;

    a {
      pointer-events: none;
      opacity: 0.7;
    }
  }
}

.button-bar {
  position: sticky;
  bottom: 0;
  padding: 0.6rem 1rem 1rem;
  margin: 1rem -1rem -1rem;
  background: theme-color(dialog-background);
  box-shadow: 0 0 4px theme-color(icon-inactive);
}
</style>

<script>
import { stringProp } from 'vue-ts-types';
import Fixture from '../../../lib/model/Fixture.js';
import Manufacturer from '../../../lib/model/Manufacturer.js';

import A11yDialog from '../A11yDialog.vue';
import DownloadButton from '../DownloadButton.vue';
import FixturePage from '../fixture-page/FixturePage.vue';
import FixtureHeader from '../FixtureHeader.vue';

const stateTitles = {
  closed: `Closed`,
  validating: `Validating your new fixture…`,
  ready: `Submit your new fixture`,
  preview: `Preview fixture`,
  uploading: `Submitting your new fixture…`,
  success: `Upload complete`,
  error: `Upload failed`,
};
const stateTitlesPlural = {
  ready: `Submit your new fixtures`,
  uploading: `Submitting your new fixtures…`,
};

export default {
  components: {
    A11yDialog,
    DownloadButton,
    FixturePage,
    FixtureHeader,
  },
  props: {
    endpoint: stringProp().required,
    githubUsername: stringProp().optional,
    githubComment: stringProp().optional,
  },
  emits: {
    success: () => true,
    reset: () => true,
  },
  data() {
    return {
      state: `closed`,
      requestBody: null,
      error: null,
      pullRequestUrl: null,
      fixtureCreateResult: null,
      previewFixtureKey: null,
    };
  },
  computed: {
    fixtureKeys() {
      if (this.fixtureCreateResult === null) {
        return [];
      }

      return Object.keys(this.fixtureCreateResult.fixtures);
    },
    isPlural() {
      return this.fixtureKeys.length > 1;
    },
    title() {
      if (this.state in stateTitlesPlural && this.isPlural) {
        return stateTitlesPlural[this.state];
      }
      return stateTitles[this.state];
    },
    rawData() {
      const rawData = JSON.stringify(this.requestBody, null, 2);

      if (this.state === `error`) {
        const backticks = '```'; // eslint-disable-line quotes
        return `${backticks}json\n${rawData}\n\n${this.error}\n${backticks}`;
      }

      return rawData;
    },
    hasPreview() {
      if (this.fixtureCreateResult === null) {
        return false;
      }

      return Object.values(this.fixtureCreateResult.errors).some(
        errors => errors.length === 0,
      );
    },
    hasValidationErrors() {
      if (this.fixtureCreateResult === null) {
        return false;
      }

      return Object.values(this.fixtureCreateResult.errors).flat().length > 0;
    },
    hasValidationWarnings() {
      if (this.fixtureCreateResult === null) {
        return false;
      }

      return Object.values(this.fixtureCreateResult.warnings).flat().length > 0;
    },
    previewFixture() {
      if (this.previewFixtureKey === null) {
        return null;
      }

      const [manufacturerKey, fixtureKey] = this.previewFixtureKey.split(`/`);

      const manufacturer = new Manufacturer(manufacturerKey, this.fixtureCreateResult.manufacturers[manufacturerKey]);

      return new Fixture(manufacturer, fixtureKey, this.fixtureCreateResult.fixtures[this.previewFixtureKey]);
    },
    previewFixtureResults() {
      if (this.previewFixtureKey === null) {
        return null;
      }

      return {
        warnings: this.fixtureCreateResult.warnings[this.previewFixtureKey],
        errors: this.fixtureCreateResult.errors[this.previewFixtureKey],
      };
    },
    previewFixtureCreateResult() {
      if (this.previewFixtureKey === null) {
        return null;
      }

      return {
        manufacturers: this.fixtureCreateResult.manufacturers,
        fixtures: {
          [this.previewFixtureKey]: this.fixtureCreateResult.fixtures[this.previewFixtureKey],
        },
        warnings: {
          [this.previewFixtureKey]: this.previewFixtureResults.warnings,
        },
        errors: {
          [this.previewFixtureKey]: this.previewFixtureResults.errors,
        },
      };
    },
  },
  methods: {
    /**
     * Called from fixture editor to open the dialog.
     * @public
     * @param {any} requestBody The data to pass to the API endpoint.
     */
    async validate(requestBody) {
      this.requestBody = requestBody;

      console.log(`validate`, structuredClone(this.requestBody));

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
    async onPreview() {
      this.previewFixtureKey = Object.keys(this.fixtureCreateResult.fixtures)[0];
      this.state = `preview`;
    },
    async onSubmit() {
      this.requestBody = {
        fixtureCreateResult: this.fixtureCreateResult,
        githubUsername: this.githubUsername ?? null,
        githubComment: this.githubComment ?? null,
      };

      console.log(`submit`, structuredClone(this.requestBody));

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
