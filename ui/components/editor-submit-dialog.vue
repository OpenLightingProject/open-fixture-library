<template>
  <app-a11y-dialog
    id="submit"
    :cancellable="false"
    :shown="submit.state !== `closed`"
    :title="title">

    <div v-if="submit.state === `validating`">Validating…</div>

    <div v-else-if="submit.state === `ready`">
      <template v-if="validationErrors.length || validationWarnings.length">
        The fixture validation returned some issues:

        <ul>
          <li v-for="message in validationErrors" :key="message">{{ message }}</li>
          <li v-for="message in validationWarnings" :key="message">{{ message }}</li>
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
        <!-- Hide the download button in case the fixture has errors. Some plugins are not able to download such fixtures. -->
        <app-download-button
          v-if="!validationErrors.length"
          button-style="select"
          :show-help="false"
          :editor-fixtures="submit.sendObject" />
        <a href="#submit" class="button primary" @click.prevent="onSubmit">Submit to OFL</a>
      </div>
    </div>

    <div v-else-if="submit.state === `uploading`">Uploading…</div>

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
        <app-download-button
          v-if="!validationErrors.length"
          button-style="select"
          :show-help="false"
          :editor-fixtures="submit.sendObject" />
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
        <a href="#cancel" class="button secondary" @click.prevent="onCancel">Close</a>
        <a
          href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
          class="button primary"
          target="_blank">Submit manually</a>
      </div>
    </div>

  </app-a11y-dialog>
</template>

<script>
import a11yDialogVue from '~/components/a11y-dialog.vue';
import downloadButtonVue from '~/components/download-button.vue';
import { clone } from '~/assets/scripts/editor-utils.mjs';

const stateTitles = {
  closed: `Closed`,
  validating: `Validating your new fixture…`,
  ready: `Submit your new fixture`,
  uploading: `Submitting your new fixture…`,
  success: `Upload complete`,
  error: `Upload failed`
};

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue,
    'app-download-button': downloadButtonVue
  },
  props: {
    submit: {
      type: Object,
      required: true,
      validate(submit) {
        const validStates = Object.keys(stateTitles);

        return `state` in submit && validStates.includes(submit.state);
      }
    }
  },
  data() {
    return {
      error: null,
      pullRequestUrl: null,
      validationErrors: [],
      validationWarnings: []
    };
  },
  computed: {
    title() {
      return stateTitles[this.submit.state];
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
      if (newState === `validating`) {
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

      this.submit.state = `uploading`;
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
