<template>
  <A11yDialog
    id="submit"
    :cancellable="false"
    :shown="state !== `closed`"
    :title="title"
    :wide="state === `preview`">

    <template v-if="state === `preview`" #after-title>
      <select
        v-if="Object.keys(fixtureCreateResult.fixtures).length > 1"
        v-model="previewFixtureKey"
        class="preview-fixture-chooser">
        <option
          v-for="key in Object.keys(fixtureCreateResult.fixtures)"
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
      <template v-else-if="hasValidationIssues">
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
        <li v-for="key in Object.keys(fixtureCreateResult.fixtures)" :key="key">
          <strong>{{ key }}</strong>
          <ul>
            <li v-for="message in fixtureCreateResult.errors[key]" :key="message">
              Error: {{ message }}
            </li>
            <li v-for="message in fixtureCreateResult.warnings[key]" :key="message">
              {{ message }}
            </li>
          </ul>
        </li>
      </ul>

      <div class="button-bar right">
        <a href="#cancel" class="button secondary" @click.prevent="onCancel">Continue editing</a>
        <a
          v-if="hasPreview"
          href="#preview"
          class="button primary"
          @click.prevent="onPreview">Preview fixture{{ isPlural ? `s` : `` }}</a>
        <a
          v-else
          href="#submit"
          class="button primary"
          @click.prevent="onSubmit">Submit to OFL</a>
      </div>
    </div>

    <div v-else-if="state === `preview`">
      <div v-if="previewFixture" class="fixture-page">
        <header class="fixture-header">
          <h1 class="title">
            {{ previewFixture.manufacturer.name }} {{ previewFixture.name }}
            <code v-if="previewFixture.hasShortName">{{ previewFixture.shortName }}</code>
          </h1>

          <DownloadButton
            v-if="fixtureCreateResult.errors[previewFixtureKey].length === 0"
            :show-help="false"
            :editor-fixtures="{
              manufacturers: { [previewFixtureKey]: fixtureCreateResult.manufacturers[previewFixtureKey] },
              fixtures: { [previewFixtureKey]: fixtureCreateResult.fixtures[previewFixtureKey] },
              warnings: { [previewFixtureKey]: fixtureCreateResult.warnings[previewFixtureKey] },
              errors: { [previewFixtureKey]: fixtureCreateResult.errors[previewFixtureKey] },
            }" />
        </header>

        <section v-if="fixtureCreateResult.warnings[previewFixtureKey].length > 0" class="card yellow">
          <strong>Warnings:<br></strong>
          <span v-for="message in fixtureCreateResult.warnings[previewFixtureKey]" :key="message">
            {{ message }}<br>
          </span>
        </section>

        <section v-if="fixtureCreateResult.errors[previewFixtureKey].length > 0" class="card red">
          <strong>Errors – not possible to show fixture preview:<br></strong>
          <span v-for="message in fixtureCreateResult.errors[previewFixtureKey]" :key="message">
            {{ message }}<br>
          </span>
        </section>

        <FixturePage
          v-if="fixtureCreateResult.errors[previewFixtureKey].length === 0"
          :fixture="previewFixture" />
      </div>

      <div class="button-bar right">
        <a href="#cancel" class="button secondary" @click.prevent="onCancel">Continue editing</a>
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
        <a href="#close" class="button secondary" @click.prevent="onReset">Close</a>
        <DownloadButton
          v-if="Object.values(fixtureCreateResult.errors).flat().length === 0"
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

<style lang="scss" scoped>
.preview-fixture-chooser {
  vertical-align: middle;
  font-size: 1rem;
  width: 350px;
  margin-left: 1ex;
}

.fixture-page {
  background: theme-color(page-background);
  margin: 1rem -1rem -1rem;
  padding: .1rem 1rem 1rem;
}

.button-bar.right {
  position: sticky;
  bottom: 0;
  background: theme-color(dialog-background);
  padding: 0.6rem 1rem 1rem;
  margin: 1rem -1rem -1rem;
  box-shadow: 0 0 4px theme-color(icon-inactive);
}
</style>

<script>
import { clone } from '../../assets/scripts/editor-utils.js';

import Manufacturer from '../../../lib/model/Manufacturer';
import Fixture from '../../../lib/model/Fixture';

import A11yDialog from '../A11yDialog.vue';
import DownloadButton from '../DownloadButton.vue';
import FixturePage from '../fixture-page/FixturePage.vue';

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
      previewFixtureKey: null,
    };
  },
  computed: {
    isPlural() {
      if (this.fixtureCreateResult === null) {
        return false;
      }

      return Object.keys(this.fixtureCreateResult.fixtures).length > 1;
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
        // eslint-disable-next-line quotes, prefer-template
        return '```json\n' + rawData + '\n```\n\n' + this.error;
      }

      return rawData;
    },
    hasPreview() {
      if (this.fixtureCreateResult === null) {
        return false; // undetermined
      }

      return Object.values(this.fixtureCreateResult.errors).some(
        errors => errors.length === 0,
      );
    },
    hasValidationIssues() {
      if (this.fixtureCreateResult === null) {
        return false; // undetermined
      }

      const warnings = Object.values(this.fixtureCreateResult.warnings).flat();
      const errors = Object.values(this.fixtureCreateResult.errors).flat();
      return warnings.length > 0 || errors.length > 0;
    },
    previewFixture() {
      if (this.previewFixtureKey === null) {
        return null;
      }

      const [manKey, fixKey] = this.previewFixtureKey.split(`/`);

      let man = manKey;
      if (manKey in this.fixtureCreateResult.manufacturers) {
        man = new Manufacturer(manKey, this.fixtureCreateResult.manufacturers[manKey]);
      }

      return new Fixture(man, fixKey, this.fixtureCreateResult.fixtures[this.previewFixtureKey]);
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
    async onPreview() {
      this.previewFixtureKey = Object.keys(this.fixtureCreateResult.fixtures)[0];
      this.state = `preview`;
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
