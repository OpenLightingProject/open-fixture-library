<template>
  <app-a11y-dialog
    id="channel"
    :cancellable="true"
    :shown="channel.editMode !== `` && channel.editMode !== `edit-?`"
    @show="onChannelDialogOpen"
    @hide="onChannelDialogClose"
    :title="title"
    ref="channelDialog">

    <vue-form
      action="#"
      :state="formstate"
      @submit.prevent="onSubmit">

      <div v-if="channel.editMode == `add-existing`" class="validate-group">
        <select size="10" required v-model="channel.uuid">
          <option
            v-for="channelUuid in currentModeUnchosenChannels"
            :key="channelUuid"
            :value="channelUuid">
            {{ getChannelName(channelUuid) }}
          </option>
        </select>
        <span class="error-message" hidden />
        or <a href="#create-channel" @click.prevent="channel.editMode = `create`">create a new channel</a>
      </div>

      <div v-else>
        <app-simple-label name="name" label="Name" :formstate="formstate">
          <app-property-input-text
            name="name"
            start-with-uppercase-or-number
            no-fine-channel-name
            v-model="channel.name"
            :schema-property="properties.channel.name"
            :required="true"
            title="Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead."
            class="channelName" />
        </app-simple-label>

        <!-- TODO: validate this right -->
        <app-simple-label name="type" label="Type" :formstate="formstate">
          <app-property-input-select
            name="type"
            v-model="channel.type"
            :schema-property="properties.channel.type"
            :required="true"
            addition-hint="other channel type" />
          <app-property-input-text
            v-if="channel.type === `[add-value]`"
            v-model="channel.typeNew"
            :schema-property="properties.definitions.nonEmptyString"
            :required="true"
            hint="other channel type" />
        </app-simple-label>

        <!-- TODO: validate this right -->
        <app-simple-label
          v-if="channel.type === `Single Color`"
          name="color"
          label="Color"
          :formstate="formstate">
          <app-property-input-select
            name="color"
            v-model="channel.color"
            :schema-property="properties.channel.color"
            :required="true"
            addition-hint="other channel color" />
          <app-property-input-text
            v-if="channel.color === `[add-value]`"
            v-model="channel.colorNew"
            :schema-property="properties.definitions.nonEmptyString"
            :required="true"
            hint="other channel color" />
        </app-simple-label>

        <h3>DMX values</h3>

        <app-simple-label name="fineness" label="Channel resolution" :formstate="formstate">
          <select name="fineness" v-model.number="channel.fineness">
            <option value="0" :selected="channel.fineness === 0">8 bit (No fine channels)</option>
            <option value="1" :selected="channel.fineness === 1">16 bit (1 fine channel)</option>
            <option value="2" :selected="channel.fineness === 2">24 bit (2 fine channels)</option>
          </select>
        </app-simple-label>

        <app-simple-label name="defaultValue" label="Default" :formstate="formstate">
          <input
            name="defaultValue"
            type="number"
            min="0"
            :max="Math.pow(256, channel.fineness + 1) - 1"
            step="1"
            v-model.number="channel.defaultValue">
        </app-simple-label>

        <app-simple-label name="highlightValue" label="Highlight" :formstate="formstate">
          <input
            name="highlightValue"
            type="number"
            min="0"
            :max="Math.pow(256, channel.fineness + 1) - 1"
            step="1"
            v-model.number="channel.highlightValue">
        </app-simple-label>

        <app-simple-label name="invert" label="Invert?" :formstate="formstate">
          <app-property-input-boolean
            name="invert"
            v-model="channel.invert"
            :schema-property="properties.channel.invert" />
        </app-simple-label>

        <app-simple-label name="constant" label="Constant?" :formstate="formstate">
          <app-property-input-boolean
            name="constant"
            v-model="channel.constant"
            :schema-property="properties.channel.constant" />
        </app-simple-label>

        <app-simple-label name="crossfade" label="Crossfade?" :formstate="formstate">
          <app-property-input-boolean
            name="crossfade"
            v-model="channel.crossfade"
            :schema-property="properties.channel.crossfade" />
        </app-simple-label>

        <app-simple-label name="precedence" label="Precedence" :formstate="formstate">
          <app-property-input-select
            name="precedence"
            v-model="channel.precedence"
            :schema-property="properties.channel.precedence" />
        </app-simple-label>

        <h3>Capabilities</h3>

        <app-simple-label
          v-if="channel.fineness > 0"
          name="capFineness"
          label="Capability resolution"
          :formstate="formstate">
          <select name="capFineness" required v-model.number="channel.capFineness">
            <option
              value="0"
              :selected="channel.capFineness === 0">8 bit (range 0 - 255)</option>
            <option
              v-if="channel.fineness >= 1"
              value="1"
              :selected="channel.capFineness === 1">16 bit (range 0 - 65535)</option>
            <option
              v-if="channel.fineness >= 2"
              value="2"
              :selected="channel.capFineness === 2">24 bit (range 0 - 16777215)</option>
          </select>
        </app-simple-label>

        <!-- <section><button class="secondary" @click.prevent="channel.wizard.show = !channel.wizard.show">${svg.getSvg(`capability-wizard`)} {{ channel.wizard.show ? 'Close' : 'Open' }} Capability Wizard</button>

        <capability-wizard v-if="channel.wizard.show" :wizard="channel.wizard" :capabilities="channel.capabilities" :fineness="Math.min(channel.fineness, channel.capFineness)" @close="channel.wizard.show = false"></capability-wizard>

        <ul class="capability-editor" v-else>
          <channel-capability v-for="(cap, index) in channel.capabilities" :key="cap.uuid" v-model="channel.capabilities" :cap-index="index" :fineness="Math.min(channel.fineness, channel.capFineness)" @scroll-item-inserted="capabilitiesScroll"></channel-capability>
        </ul> -->

      </div>

      <div class="button-bar right">
        <button type="submit" class="primary" :disabled="channel.wizard.show">{{ channel.editMode === "add-existing" ? "Add channel" : channel.editMode === "create" ? "Create channel" : "Save changes" }}</button>
      </div>

    </vue-form>

  </app-a11y-dialog>
</template>

<script>
import scrollIntoView from 'scroll-into-view';
import uuidV4 from 'uuid/v4.js';

import schemaProperties from '~~/lib/schema-properties.js';

import a11yDialogVue from '~/components/a11y-dialog.vue';
import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputBooleanVue from '~/components/property-input-boolean.vue';
import propertyInputSelectVue from '~/components/property-input-select.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue,
    'app-simple-label': simpleLabelVue,
    'app-property-input-boolean': propertyInputBooleanVue,
    'app-property-input-select': propertyInputSelectVue,
    'app-property-input-text': propertyInputTextVue
  },
  model: {
    prop: `channel`
  },
  props: {
    'channel': {
      type: Object,
      required: true
    },
    'fixture': {
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
        const firstErrorName = Object.keys(this.formstate.$error)[0];
        const field = document.querySelector(`[name=${firstErrorName}]`);
        const scrollContainer = field.closest(`.dialog`);

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
      this.fixture.availableChannels[this.channel.uuid] = getSanitizedChannel(this.channel);

      let maxFoundFineness = 0;
      for (const chId of Object.keys(this.fixture.availableChannels)) {
        const fineChannel = this.fixture.availableChannels[chId];
        if (`coarseChannelId` in fineChannel && fineChannel.coarseChannelId === this.channel.uuid) {
          maxFoundFineness = Math.max(maxFoundFineness, fineChannel.fineness);
          if (fineChannel.fineness > this.channel.fineness) {
            this.$emit(`remove-channel`, chId);
          }
        }
      }

      this.addFineChannels(this.channel, maxFoundFineness + 1, false);
    },

    saveDuplicatedChannel() {
      const oldChannelKey = this.channel.uuid;

      const newChannelKey = uuidV4();
      const newChannel = getSanitizedChannel(this.channel);
      newChannel.uuid = newChannelKey;
      this.$set(this.fixture.availableChannels, newChannelKey, newChannel);

      this.addFineChannels(this.channel, 1, false);

      this.currentMode.channels = this.currentMode.channels.map(key => {
        if (key === oldChannelKey) {
          return newChannelKey;
        }

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
     */
    addFineChannels(coarseChannel, offset, addToMode) {
      for (let i = offset; i <= coarseChannel.fineness; i++) {
        const fineChannel = getEmptyFineChannel(coarseChannel.uuid, i);
        this.$set(this.fixture.availableChannels, fineChannel.uuid, getSanitizedChannel(fineChannel));

        if (addToMode) {
          this.currentMode.channels.push(fineChannel.uuid);
        }
      }
    },

    resetChannelForm() {
      this.$emit(`reset-channel`);
      this.$nextTick(() => {
        this.formstate._reset(); // resets validation status
      });
    }
  }
};

/**
 * @param {!object} channel The channel object.
 * @returns {!boolean} False if the channel object is still empty / unchanged, true otherwise.
 */
function isChannelChanged(channel) {
  return Object.keys(channel).some(prop => {
    if ([`uuid`, `editMode`, `modeId`, `wizard`].includes(prop)) {
      return false;
    }

    if ([`defaultValue`, `highlightValue`, `invert`, `constant`, `crossfade`].includes(prop)) {
      return channel[prop] !== null;
    }

    if (prop === `fineness` || prop === `capFineness`) {
      return channel[prop] !== 0;
    }

    if (prop === `capabilities`) {
      return channel.capabilities.some(isCapabilityChanged);
    }

    return channel[prop] !== ``;
  });
}

/**
 * @param {!object} cap The capability object.
 * @returns {!boolean} False if the capability object is still empty / unchanged, true otherwise.
 */
function isCapabilityChanged(cap) {
  return Object.keys(cap).some(prop => {
    if (prop === `uuid`) {
      return false;
    }

    if (prop === `range`) {
      return cap.range !== null;
    }

    return cap[prop] !== ``;
  });
}

/**
 * @param {!object} channel The channel object that shall be sanitized.
 * @returns {!object} A clone of the channel object without properties that are just relevant for displaying it in the channel dialog.
 */
function getSanitizedChannel(channel) {
  const retChannel = clone(channel);
  delete retChannel.editMode;
  delete retChannel.modeId;
  delete retChannel.wizard;

  return retChannel;
}

/**
 * @param {!string} coarseChannelId The UUID of the coarse channel.
 * @param {!number} fineness The fineness of the newly created fine channel.
 * @returns {!object} An empty fine channel object for the given coarse channel.
 */
function getEmptyFineChannel(coarseChannelId, fineness) {
  return {
    uuid: uuidV4(),
    coarseChannelId: coarseChannelId,
    fineness: fineness
  };
}

/**
 * @param {*} obj The object / array / ... to clone. Note: only JSON-stringifiable objects / properties are cloneable, i.e. no functions.
 * @returns {*} A deep clone.
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
</script>
