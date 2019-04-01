<template>
  <app-a11y-dialog
    id="submit"
    :cancellable="false"
    :shown="submit.state !== `closed`"
    :title="title">

    <a ref="downloadAnchorElement" download="ofl-editor-fixtures.json" hidden />

    <div v-if="submit.state === `loading`">Uploading…</div>

    <div v-else-if="submit.state === `ready`">
      You can now submit your fixture to the Open Fixture Library website or download it for private use.

      <div class="button-bar right">
        <a class="button secondary" @click.prevent="onCancel">Continue editing</a>
        <a class="button secondary" @click.prevent="onDownload">Download</a>
        <a class="button primary" @click.prevent="onSubmit">Submit to OFL</a>
      </div>
    </div>

    <div v-else-if="submit.state === `success`">
      Your fixture was successfully uploaded to GitHub (see the
      <a
        :href="submit.pullRequestUrl"
        target="_blank">pull request</a>).
      It will be now reviewed and then published on the website (this may take a few days).
      Thank you for your contribution!

      <div class="button-bar right">
        <nuxt-link to="/" class="button secondary">Back to homepage</nuxt-link>
        <a
          href="/fixture-editor"
          class="button secondary"
          @click.prevent="$emit(`reset`)">Create another fixture</a>
        <a :href="submit.pullRequestUrl" class="button secondary" target="_blank">See pull request</a>
        <a class="button primary" @click.prevent="onDownload">Download</a>
      </div>
    </div>

    <div v-else-if="submit.state === `error`">
      Unfortunately, there was an error while uploading. Please copy the following data and
      <a
        href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
        target="_blank">manually submit them to GitHub</a>.

      <textarea v-model="rawData" readonly />

      <div class="button-bar right">
        <a class="button secondary" @click.prevent="onCancel">Cancel</a>
        <a
          href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
          class="button primary"
          target="_blank">Submit manually</a>
      </div>
    </div>

    <!-- <div v-else-if="submit.state === `invalid`">
    Unfortunately, the fixture you uploaded was invalid. Please correct the following mistakes before trying again.
    <textarea v-model="submit.mistakes" readonly />
    <textarea v-model="submit.rawData" readonly />
    <div class="button-bar right">
    <button class="primary" data-action="home">Back to homepage</button>
    </div>
    </div>-->
  </app-a11y-dialog>
</template>

<script>
import a11yDialogVue from '~/components/a11y-dialog.vue';
import { clone } from '~/assets/scripts/editor-utils.mjs';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue
  },
  props: {
    submit: {
      type: Object,
      required: true
    }
  },
  computed: {
    title() {
      if (this.submit.state === `ready`) {
        return `Submit your new fixture`;
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
        return '```json\n' + rawData + '\n```\n\n' + this.submit.error;
      }

      return rawData;
    }
  },
  methods: {
    async onSubmit() {
      console.log(`submit`, clone(this.submit.sendObject));

      try {
        const response = await this.$axios.post(
          `/ajax/submit-editor`,
          this.submit.sendObject
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        this.submit.pullRequestUrl = response.data.pullRequestUrl;
        this.submit.state = `success`;
        this.clearAutoSave();
      }
      catch (error) {
        console.error(`There was a problem with the request.`, error);

        this.submit.error = error.message;
        this.submit.state = `error`;
      }
    },
    onDownload() {
      // eslint-disable-next-line prefer-template
      const dataStr = `data:text/json;charset=utf-8,` + encodeURIComponent(JSON.stringify(this.submit.sendObject, null, 2));
      const dlAnchorElem = this.$refs.downloadAnchorElement;

      dlAnchorElem.setAttribute(`href`, dataStr);
      dlAnchorElem.click();
    },
    onCancel() {
      this.submit.state = `closed`;
    }
  }
};
</script>
