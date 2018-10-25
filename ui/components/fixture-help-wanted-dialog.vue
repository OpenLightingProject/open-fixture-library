<template>
  <app-a11y-dialog
    id="help-wanted"
    ref="dialog"
    :cancellable="state !== `loading`"
    :shown="context !== null"
    :title="title"
    @hide="onHide">

    <form v-if="state === `ready` && context !== null" action="#" @submit.prevent="onSubmit">
      <app-labeled-value
        v-if="location !== null"
        :value="location"
        label="Location" />

      <app-labeled-value
        v-if="context.helpWanted !== null"
        :value="context.helpWanted"
        label="Problem description" />

      <app-labeled-input
        name="message"
        label="Message">
        <app-property-input-textarea
          v-model="message"
          :schema-property="{}"
          name="message" />
      </app-labeled-input>

      <app-labeled-input
        name="github-username"
        label="GitHub username"
        hint="If you want to be mentioned in the issue.">
        <app-property-input-text
          v-model="githubUsername"
          :schema-property="{}"
          name="github-username" />
      </app-labeled-input>

      <div class="button-bar right">
        <button :disabled="message === ``" type="submit" class="primary">Send information</button>
      </div>
    </form>

    <template v-else-if="state === `loading`">
      Uploading…
    </template>

    <template v-else-if="state === `success`">
      Your information was successfully uploaded to GitHub (see the <a :href="issueUrl" target="_blank">issue</a>). The fixture will be updated as soon as your information has been reviewed. Thank you for your contribution!

      <div class="button-bar right">
        <a href="#" class="button secondary" @click.prevent="hide">Close</a>
        <a :href="issueUrl" class="button primary" target="_blank">See issue</a>
      </div>
    </template>

    <template v-else-if="state === `error`">
      Unfortunately, there was an error while uploading. Please copy the following data and manually submit it.

      <textarea :value="errorData" readonly />

      <div class="button-bar right">
        <a href="#" class="button secondary" @click.prevent="hide">Close</a>
        <a :href="mailtoUrl" class="button secondary" target="_blank">Send email</a>
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new" class="button primary" target="_blank">Create issue on GitHub</a>
      </div>
    </template>

  </app-a11y-dialog>
</template>

<script>
import a11yDialogVue from '~/components/a11y-dialog.vue';

import Fixture from '~~/lib/model/Fixture.mjs';
import Capability from '~~/lib/model/Capability.mjs';

import labeledInputVue from '~/components/labeled-input.vue';
import labeledValueVue from '~/components/labeled-value.vue';
import propertyInputText from '~/components/property-input-text.vue';
import propertyInputTextarea from '~/components/property-input-textarea.vue';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue,
    'app-labeled-input': labeledInputVue,
    'app-labeled-value': labeledValueVue,
    'app-property-input-text': propertyInputText,
    'app-property-input-textarea': propertyInputTextarea
  },
  model: {
    prop: `context`
  },
  props: {
    context: {
      type: [Fixture, Capability],
      default: null
    }
  },
  data: () => {
    return {
      state: `ready`,
      message: ``,
      githubUsername: ``,
      issueUrl: null,
      error: null
    };
  },
  computed: {
    title() {
      if (this.state === `loading`) {
        return `Sending your message…`;
      }

      if (this.state === `success`) {
        return `Message sent`;
      }

      if (this.state === `error`) {
        return `Failed to send message`;
      }

      return `Improve fixture`;
    },
    location() {
      if (this.context instanceof Capability) {
        const cap = this.context;
        const channel = cap._channel;
        return `Channel "${channel.name}" → Capability "${cap.name}" (${cap.rawDmxRange})`;
      }

      return null;
    },
    fixture() {
      if (this.context instanceof Fixture) {
        return this.context;
      }
      if (this.context instanceof Capability) {
        return this.context._channel.fixture;
      }

      return null;
    },
    sendObject() {
      return {
        manKey: this.fixture.manufacturer.key,
        fixKey: this.fixture.key,
        location: this.location,
        helpWanted: this.context.helpWanted,
        message: this.message,
        githubUsername: this.githubUsername !== `` ? this.githubUsername : null
      };
    },
    errorData() {
      return `${JSON.stringify(this.sendObject, null, 2)}\n\n${this.error}`;
    },
    mailtoUrl() {
      const subject = `Feedback for fixture '${this.sendObject.manKey}/${this.sendObject.fixKey}'`;

      const mailBodyData = {
        'Problem location': this.location,
        'Problem description': this.context.helpWanted,
        'Message': this.message
      };

      const body = Object.entries(mailBodyData).filter(
        ([key, value]) => value !== null
      ).map(
        ([key, value]) => {
          if (value.includes(`\n`)) {
            return `${key}:\n${value}`;
          }
          return `${key}: ${value}`;
        }
      ).join(`\n`);

      return `mailto:florian-edelmann@online.de?subject=${subject}&body=${body.replace(/\n/g, str => escape(str))}`;
    }
  },
  methods: {
    async onSubmit() {
      this.state = `loading`;

      try {
        const response = await this.$axios.post(`/ajax/submit-feedback`, this.sendObject);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        this.issueUrl = response.data.issueUrl;
        this.state = `success`;
      }
      catch (error) {
        console.error(`There was a problem with the request.`, error);
        this.error = error.message;
        this.state = `error`;
      }
    },
    hide() {
      this.$refs.dialog.$emit(`hide`);
    },
    onHide() {
      if (this.state === `success`) {
        this.message = ``;
      }

      this.state = `ready`;
      this.issueUrl = null;
      this.error = null;
      this.$emit(`input`, null);
    }
  }
};
</script>
