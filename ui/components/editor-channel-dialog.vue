<template>
  <app-a11y-dialog
    id="channel"
    :cancellable="true"
    :shown="channel.editMode !== `` && channel.editMode !== `edit-?`"
    @show="onChannelDialogOpen"
    @hide="onChannelDialogClose"
    :title="title"
    ref="channelDialog">

    <form
      action="#"
      id="channel-form"
      data-validate
      ref="channelForm">

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
        <section class="channel-name">
          <app-simple-label label="Name">
            <app-property-input
              type="text"
              v-model="channel.name"
              :schema-property="properties.channel.name"
              :required="true"
              pattern="^[A-Z0-9]((?!\b[Ff]ine\b)(?!\\d+(?:\\s|-|_)*[Bb]it)(?!MSB)(?!LSB).)*$"
              title="Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead."
              class="channelName" />
          </app-simple-label>
        </section>

        <section class="channel-type">
          <app-simple-label label="Type">
            <app-property-input
              type="select"
              v-model="channel.type"
              :schema-property="properties.channel.type"
              :required="true"
              addition-hint="other channel type" />
            <app-property-input
              type="text"
              v-if="channel.type === `[add-value]`"
              v-model="channel.typeNew"
              :schema-property="properties.definitions.nonEmptyString"
              :required="true"
              hint="other channel type" />
          </app-simple-label>
        </section>

        <section class="channel-color" v-if="channel.type === `Single Color`">
          <app-simple-label label="Color">
            <app-property-input
              type="select"
              v-model="channel.color"
              :schema-property="properties.channel.color"
              :required="true"
              addition-hint="other channel color" />
            <app-property-input
              type="text"
              v-if="channel.color === `[add-value]`"
              v-model="channel.colorNew"
              :schema-property="properties.definitions.nonEmptyString"
              :required="true"
              hint="other channel color" />
          </app-simple-label>
        </section>

        <h3>DMX values</h3>

        <section class="channel-fineness">
          <app-simple-label label="Channel resolution">
            <select required v-model.number="channel.fineness">
              <option value="0" selected>8 bit (No fine channels)</option>
              <option value="1">16 bit (1 fine channel)</option>
              <option value="2">24 bit (2 fine channels)</option>
            </select>
          </app-simple-label>
        </section>

        <section class="channel-defaultValue">
          <app-simple-label label="Default">
            <input
              type="number"
              min="0"
              :max="Math.pow(256, channel.fineness + 1) - 1"
              step="1"
              v-model.number="channel.defaultValue">
          </app-simple-label>
        </section>

        <section class="channel-highlightValue">
          <app-simple-label label="Highlight">
            <input
              type="number"
              min="0"
              :max="Math.pow(256, channel.fineness + 1) - 1"
              step="1"
              v-model.number="channel.highlightValue">
          </app-simple-label>
        </section>

        <section class="channel-invert">
          <app-simple-label label="Invert?">
            <app-property-input
              type="boolean"
              v-model="channel.invert"
              :schema-property="properties.channel.invert" />
          </app-simple-label>
        </section>

        <section class="channel-constant">
          <app-simple-label label="Constant?">
            <app-property-input
              type="boolean"
              v-model="channel.constant"
              :schema-property="properties.channel.constant" />
          </app-simple-label>
        </section>

        <section class="channel-crossfade">
          <app-simple-label label="Crossfade?">
            <app-property-input
              type="boolean"
              v-model="channel.crossfade"
              :schema-property="properties.channel.crossfade" />
          </app-simple-label>
        </section>

        <section class="channel-precedence">
          <app-simple-label label="Precedence">
            <app-property-input
              type="select"
              v-model="channel.precedence"
              :schema-property="properties.channel.precedence" />
          </app-simple-label>
        </section>

        <h3>Capabilities</h3>

        <!--<section class="channel-cap-fineness" v-if="channel.fineness > 0">
        str += simpleLabel(`Capability resolution`, `<select required v-model.number="channel.capFineness">`
          + `<option value="0" selected>8 bit (range 0 - 255)</option>`
          + `<option value="1" v-if="channel.fineness >= 1">16 bit (range 0 - 65535)</option>`
          + `<option value="2" v-if="channel.fineness >= 2">24 bit (range 0 - 16777215)</option>`
          + `</select>`
        );
        </section>

        <section><button class="secondary" @click.prevent="channel.wizard.show = !channel.wizard.show">${svg.getSvg(`capability-wizard`)} {{ channel.wizard.show ? 'Close' : 'Open' }} Capability Wizard</button>

        <capability-wizard v-if="channel.wizard.show" :wizard="channel.wizard" :capabilities="channel.capabilities" :fineness="Math.min(channel.fineness, channel.capFineness)" @close="channel.wizard.show = false"></capability-wizard>

        <ul class="capability-editor" v-else>
          <channel-capability v-for="(cap, index) in channel.capabilities" :key="cap.uuid" v-model="channel.capabilities" :cap-index="index" :fineness="Math.min(channel.fineness, channel.capFineness)" @scroll-item-inserted="capabilitiesScroll"></channel-capability>
        </ul> -->

      </div>

      <div class="button-bar right">
        <button type="submit" class="primary" :disabled="channel.wizard.show">{{ channel.editMode === "add-existing" ? "Add channel" : channel.editMode === "create" ? "Create channel" : "Save changes" }}</button>
      </div>

    </form>

  </app-a11y-dialog>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import a11yDialogVue from '~/components/a11y-dialog.vue';
import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputVue from '~/components/property-input.vue';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue,
    'app-simple-label': simpleLabelVue,
    'app-property-input': propertyInputVue
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

          const maxFoundFineness = Math.max(...otherFineChannels.map(
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

      return `Edit channel`;
    }
  },
  methods: {
    onChannelDialogOpen() {
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

      const editMode = this.channel.editMode;
      this.channel.editMode = ``;

      if (this.channelChanged && !window.confirm(`Do you want to lose the entered channel data?`)) {
        this.$nextTick(() => {
          this.channel.editMode = editMode;
        });
        return;
      }

      this.resetChannelForm();
    },
    resetChannelForm() {
      this.$emit(`reset-channel`);
      this.$nextTick(() => {
        this.$refs.channelForm.reset(); // resets browser validation status
      });
    }
  }
};

/**
 * @param {*} obj The object / array / ... to clone. Note: only JSON-stringifiable objects / properties are cloneable, i.e. no functions.
 * @returns {*} A deep clone.
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
</script>
