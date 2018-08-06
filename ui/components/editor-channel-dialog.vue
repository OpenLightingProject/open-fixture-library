<template>
  <app-a11y-dialog
    id="channel"
    ref="channelDialog"
    :cancellable="true"
    :shown="channel.editMode !== `` && channel.editMode !== `edit-?`"
    :title="title"
    @show="onChannelDialogOpen"
    @hide="onChannelDialogClose">

    <vue-form
      :state="formstate"
      action="#"
      @submit.prevent="onSubmit">

      <div v-if="channel.editMode == `add-existing`">
        <select v-model="channel.uuid" size="10" required>
          <option
            v-for="channelUuid in currentModeUnchosenChannels"
            :key="channelUuid"
            :value="channelUuid">
            {{ getChannelName(channelUuid) }}
          </option>
        </select>
        <span class="error-message" hidden />
        or <a href="#create-channel" @click.prevent="setEditModeCreate">create a new channel</a>
      </div>

      <div v-else>
        <app-labeled-input :formstate="formstate" name="name" label="Name">
          <app-property-input-text
            v-model="channel.name"
            :schema-property="properties.channel.name"
            :required="true"
            name="name"
            start-with-uppercase-or-number
            no-fine-channel-name
            title="Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead."
            class="channelName" />
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="fineness" label="Channel resolution">
          <select v-model="channel.fineness" name="fineness">
            <option :value="0">8 bit (No fine channels)</option>
            <option :value="1">16 bit (1 fine channel)</option>
            <option :value="2">24 bit (2 fine channels)</option>
          </select>
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="defaultValue" label="Default DMX value">
          <input
            v-model.number="channel.defaultValue"
            :max="Math.pow(256, channel.fineness + 1) - 1"
            name="defaultValue"
            type="number"
            min="0"
            step="1">
        </app-labeled-input>

        <h3>Capabilities<template v-if="!channel.wizard.show && channel.capabilities.length > 1">
          <a
            href="#expand-all"
            class="icon-button expand-all"
            title="Expand all capabilities"
            @click.prevent="openDetails">
            <app-svg name="chevron-double-down" />
          </a>
          <a
            href="#collapse-all"
            class="icon-button collapse-all"
            title="Collapse all capabilities"
            @click.prevent="closeDetails">
            <app-svg name="chevron-double-up" />
          </a>
        </template></h3>

        <app-labeled-input
          v-if="channel.fineness > 0"
          :formstate="formstate"
          name="capFineness"
          label="Capability resolution">
          <select v-model="channel.capFineness" name="capFineness" required>
            <option :value="0">8 bit (range 0 - 255)</option>
            <option v-if="channel.fineness >= 1" :value="1">16 bit (range 0 - 65535)</option>
            <option v-if="channel.fineness >= 2" :value="2">24 bit (range 0 - 16777215)</option>
          </select>
        </app-labeled-input>

        <app-editor-capability-wizard
          v-if="channel.wizard.show"
          :wizard="channel.wizard"
          :capabilities="channel.capabilities"
          :fineness="Math.min(channel.fineness, channel.capFineness)"
          :formstate="formstate"
          @close="onWizardClose" />

        <div v-else class="capability-editor">
          <app-editor-capability
            v-for="(cap, index) in channel.capabilities"
            ref="capabilities"
            :key="cap.uuid"
            :capabilities="channel.capabilities"
            :formstate="formstate"
            :cap-index="index"
            :fineness="Math.min(channel.fineness, channel.capFineness)"
            @insert-capability-before="insertEmptyCapability(index)"
            @insert-capability-after="insertEmptyCapability(index + 1)" />
        </div>

        <section>
          <a href="#wizard" class="button secondary" @click.prevent="channel.wizard.show = !channel.wizard.show">
            <app-svg name="capability-wizard" />
            {{ channel.wizard.show ? 'Close' : 'Open' }} Capability Wizard
          </a>
        </section>

        <h3>Advanced channel settings</h3>

        <app-labeled-input :formstate="formstate" name="highlightValue" label="Highlight DMX value">
          <input
            v-model.number="channel.highlightValue"
            :max="Math.pow(256, channel.fineness + 1) - 1"
            name="highlightValue"
            type="number"
            min="0"
            step="1">
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="constant" label="Constant?">
          <app-property-input-boolean
            v-model="channel.constant"
            :schema-property="properties.channel.constant"
            name="constant" />
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="precedence" label="Precedence">
          <app-property-input-select
            v-model="channel.precedence"
            :schema-property="properties.channel.precedence"
            name="precedence" />
        </app-labeled-input>

      </div>

      <div class="button-bar right">
        <button :disabled="channel.wizard.show" type="submit" class="primary">{{ channel.editMode === "add-existing" ? "Add channel" : channel.editMode === "create" ? "Create channel" : "Save changes" }}</button>
      </div>

    </vue-form>

  </app-a11y-dialog>
</template>

<style lang="scss" scoped>
.expand-all,
.collapse-all {
  margin-left: 1ex;
  font-size: 0.8rem;
}
</style>

<style lang="scss">
@import '~assets/styles/vars.scss';

#channel-dialog {
  /* prevent smooth scrolling when triggered from capability insertion etc. */
  scroll-behavior: auto;
}

@media (min-width: $phone) {
  #channel-dialog {
    max-width: 700px;
    width: 80%;
  }
}
</style>

<script>
import scrollIntoView from 'scroll-into-view';
import uuidV4 from 'uuid/v4.js';

import schemaProperties from '~~/lib/schema-properties.js';
import {
  getEmptyCapability,
  getEmptyFineChannel,
  getSanitizedChannel,
  isChannelChanged,
  clone
} from '~/assets/scripts/editor-utils.mjs';

import a11yDialogVue from '~/components/a11y-dialog.vue';
import editorCapabilityVue from '~/components/editor-capability.vue';
import editorCapabilityWizardVue from '~/components/editor-capability-wizard.vue';
import labeledInputVue from '~/components/labeled-input.vue';
import propertyInputBooleanVue from '~/components/property-input-boolean.vue';
import propertyInputSelectVue from '~/components/property-input-select.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue,
    'app-editor-capability': editorCapabilityVue,
    'app-editor-capability-wizard': editorCapabilityWizardVue,
    'app-labeled-input': labeledInputVue,
    'app-property-input-boolean': propertyInputBooleanVue,
    'app-property-input-select': propertyInputSelectVue,
    'app-property-input-text': propertyInputTextVue,
    'app-svg': svgVue
  },
  model: {
    prop: `channel`
  },
  props: {
    channel: {
      type: Object,
      required: true
    },
    fixture: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formstate: {},
      restored: false,
      channelChanged: false,
      properties: schemaProperties
    };
  },
  computed: {
    currentMode() {
      const uuid = this.channel.modeId;
      const modeIndex = this.fixture.modes.findIndex(mode => mode.uuid === uuid);
      return this.fixture.modes[modeIndex];
    },
    currentModeUnchosenChannels() {
      return Object.keys(this.fixture.availableChannels).filter(channelUuid => {
        if (this.currentMode.channels.includes(channelUuid)) {
          // already used
          return false;
        }

        const channel = this.fixture.availableChannels[channelUuid];
        if (`coarseChannelId` in channel) {
          // should we include this fine channel?

          if (!this.currentMode.channels.includes(channel.coarseChannelId)) {
            // its coarse channel is not yet in the mode
            return false;
          }

          const modeChannels = this.currentMode.channels.map(
            uuid => this.fixture.availableChannels[uuid]
          );

          const otherFineChannels = modeChannels.filter(
            ch => `coarseChannelId` in ch && ch.coarseChannelId === channel.coarseChannelId
          );

          const maxFoundFineness = Math.max(0, ...otherFineChannels.map(
            ch => ch.fineness
          ));

          if (maxFoundFineness < channel.fineness - 1) {
            // the finest channel currently used is not its next coarser channel
            return false;
          }
        }

        return true;
      });
    },
    currentModeDisplayName() {
      let modeName = `#${this.fixture.modes.indexOf(this.currentMode) + 1}`;
      if (this.currentMode.shortName) {
        modeName = `"${this.currentMode.shortName}"`;
      }
      else if (this.currentMode.name) {
        modeName = `"${this.currentMode.name}"`;
      }
      return modeName;
    },
    title() {
      if (this.channel.editMode === `add-existing`) {
        return `Add channel to mode ${this.currentModeDisplayName}`;
      }

      if (this.channel.editMode === `create`) {
        return `Create new channel`;
      }

      if (this.channel.editMode === `edit-duplicate`) {
        return `Edit channel duplicate`;
      }

      return `Edit channel`;
    }
  },
  watch: {
    channel: {
      handler: function() {
        if (isChannelChanged(this.channel)) {
          this.$emit(`channel-changed`);
          this.channelChanged = true;
        }
      },
      deep: true
    }
  },
  methods: {
    setEditModeCreate() {
      this.channel.editMode = `create`;
      this.channel.uuid = uuidV4();
    },

    getChannelName(channelUuid) {
      const fixtureEditor = this.$parent;
      return fixtureEditor.getChannelName(channelUuid);
    },

    onChannelDialogOpen() {
      if (this.restored) {
        this.restored = false;
        return;
      }

      if (this.channel.editMode === `add-existing` && this.currentModeUnchosenChannels.length === 0) {
        this.channel.editMode = `create`;
      }
      else if (this.channel.editMode === `edit-all` || this.channel.editMode === `edit-duplicate`) {
        const channel = this.fixture.availableChannels[this.channel.uuid];
        for (const prop of Object.keys(channel)) {
          this.channel[prop] = clone(channel[prop]);
        }
      }

      // after dialog is opened
      this.$nextTick(() => {
        this.channelChanged = false;
      });
    },

    onChannelDialogClose() {
      if (this.channel.editMode === ``) {
        // saving did already manage everything
        return;
      }

      if (this.channelChanged && !window.confirm(`Do you want to lose the entered channel data?`)) {
        this.$nextTick(() => {
          this.restored = true;
          this.$refs.channelDialog.show();
        });
        return;
      }

      this.resetChannelForm();
    },

    onSubmit() {
      if (this.formstate.$invalid) {
        const field = document.querySelector(`#channel-dialog .vf-field-invalid`);
        const scrollContainer = field.closest(`dialog`);

        const enclosingDetails = field.closest(`details`);
        if (enclosingDetails) {
          enclosingDetails.open = true;
        }

        scrollIntoView(field, {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100
          },
          isScrollable: target => target === scrollContainer
        }, () => field.focus());

        return;
      }

      this.$refs.capabilities.forEach(capability => capability.cleanCapabilityData());

      if (this.channel.editMode === `create`) {
        this.saveCreatedChannel();
      }
      else if (this.channel.editMode === `edit-all`) {
        this.saveEditedChannel();
      }
      else if (this.channel.editMode === `edit-duplicate`) {
        this.saveDuplicatedChannel();
      }
      else if (this.channel.editMode === `add-existing`) {
        this.addExistingChannel();
      }

      this.resetChannelForm();
    },

    saveCreatedChannel() {
      this.$set(this.fixture.availableChannels, this.channel.uuid, getSanitizedChannel(this.channel));
      this.currentMode.channels.push(this.channel.uuid);

      this.addFineChannels(this.channel, 1, true);
    },

    saveEditedChannel() {
      const previousFineness = this.fixture.availableChannels[this.channel.uuid].fineness;
      this.fixture.availableChannels[this.channel.uuid] = getSanitizedChannel(this.channel);

      if (previousFineness > this.channel.fineness) {
        for (const chId of Object.keys(this.fixture.availableChannels)) {
          const channel = this.fixture.availableChannels[chId];
          if (channel.coarseChannelId === this.channel.uuid && channel.fineness > this.channel.fineness) {
            this.$emit(`remove-channel`, chId);
          }
        }
      }
      else {
        this.addFineChannels(this.channel, previousFineness + 1, false);
      }
    },

    saveDuplicatedChannel() {
      const oldChannelKey = this.channel.uuid;

      const newChannelKey = uuidV4();
      const newChannel = getSanitizedChannel(this.channel);
      newChannel.uuid = newChannelKey;
      this.$set(this.fixture.availableChannels, newChannelKey, newChannel);

      const fineChannelUuids = this.addFineChannels(newChannel, 1, false);

      this.currentMode.channels = this.currentMode.channels.map(key => {
        if (key === oldChannelKey) {
          return newChannelKey;
        }

        // map each old fine channel to the new fine channel
        const oldFineChannel = this.fixture.availableChannels[key];
        if (oldFineChannel.coarseChannelId === oldChannelKey) {
          return fineChannelUuids[oldFineChannel.fineness];
        }

        // this channel is not affected by the duplicate at all
        return key;
      });
    },

    addExistingChannel() {
      this.currentMode.channels.push(this.channel.uuid);
    },

    /**
     * @param {!object} coarseChannel The channel object of the coarse channel.
     * @param {!number} offset At which fineness should be started.
     * @param {boolean} [addToMode] If true, the fine channel is pushed to the current mode's channels.
     * @returns {!Array.<string>} Array of added fine channel UUIDs (at the index of their fineness).
     */
    addFineChannels(coarseChannel, offset, addToMode) {
      const addedFineChannelUuids = [];

      for (let i = offset; i <= coarseChannel.fineness; i++) {
        const fineChannel = getEmptyFineChannel(coarseChannel.uuid, i);
        this.$set(this.fixture.availableChannels, fineChannel.uuid, getSanitizedChannel(fineChannel));
        addedFineChannelUuids[i] = fineChannel.uuid;

        if (addToMode) {
          this.currentMode.channels.push(fineChannel.uuid);
        }
      }

      return addedFineChannelUuids;
    },

    resetChannelForm() {
      this.$emit(`reset-channel`);
      this.$nextTick(() => {
        this.formstate._reset(); // resets validation status
      });
    },

    onWizardClose(insertIndex) {
      this.channel.wizard.show = false;

      this.$nextTick(() => {
        const firstNewCap = this.$refs.capabilities[insertIndex];
        const scrollContainer = firstNewCap.$el.closest(`dialog`);

        scrollIntoView(firstNewCap.$el, {
          time: 0,
          align: {
            top: 0,
            left: 0,
            topOffset: 100
          },
          isScrollable: target => target === scrollContainer
        }, () => firstNewCap.$refs.firstInput.focus());
      });
    },

    openDetails() {
      this.$el.querySelectorAll(`details`).forEach(details => {
        details.open = true;
      });
    },

    closeDetails() {
      this.$el.querySelectorAll(`details`).forEach(details => {
        details.open = false;
      });
    },

    insertEmptyCapability(index) {
      this.channel.capabilities.splice(index, 0, getEmptyCapability());
    }
  }
};
</script>
