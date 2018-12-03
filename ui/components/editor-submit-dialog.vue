<template>
  <app-a11y-dialog
    id="submit"
    :cancellable="false"
    :shown="submit.state !== `closed`"
    :title="title">

    <div v-if="submit.state === `loading`">Uploading…</div>

    <div v-else-if="submit.state === `success`">
      Your fixture was successfully uploaded to GitHub (see the <a :href="submit.pullRequestUrl" target="_blank">pull request</a>). It will be now reviewed and then merged into the library. Thank you for your contribution!

      <div class="button-bar right">
        <nuxt-link to="/" class="button secondary">Back to homepage</nuxt-link>
        <a href="/fixture-editor" class="button secondary" @click.prevent="$emit(`reset`)">Create another fixture</a>
        <a :href="submit.pullRequestUrl" class="button primary" target="_blank">See pull request</a>
      </div>
    </div>

    <div v-else-if="submit.state === `error`">
      <span>Unfortunately, there was an error while uploading. Please copy the following data and <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new" target="_blank">manually submit them to GitHub</a>.</span>

      <textarea v-model="submit.rawData" readonly />

      <div class="button-bar right">
        <nuxt-link to="/" class="button secondary">Back to homepage</nuxt-link>
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new" class="button primary" target="_blank">Submit manually</a>
      </div>
    </div>

    <!-- <div v-else-if="submit.state === `invalid`">
    Unfortunately, the fixture you uploaded was invalid. Please correct the following mistakes before trying again.
    <textarea v-model="submit.mistakes" readonly />
    <textarea v-model="submit.rawData" readonly />
    <div class="button-bar right">
    <button class="primary" data-action="home">Back to homepage</button>
    </div>
    </div> -->

  </app-a11y-dialog>
</template>

<script>
import a11yDialogVue from '~/components/a11y-dialog.vue';

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
      if (this.submit.state === `loading`) {
        return `Submitting your new fixture…`;
      }

      if (this.submit.state === `success`) {
        return `Upload complete`;
      }

      return `Upload failed`;
    }
  }
};
</script>
