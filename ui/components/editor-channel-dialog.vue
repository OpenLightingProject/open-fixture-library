<template>
  <app-a11y-dialog
    id="channel"
    ref="channelDialog"
    :cancellable="true"
    :shown="channel.editMode !== `` && channel.editMode !== `edit-?`"
    :title="title"
    :class="`channel-dialog-${channel.editMode}`"
    @show="onChannelDialogOpen"
    @hide="onChannelDialogClose">

    <vue-form
      :state="formstate"
      action="#"
      @submit.prevent="onSubmit">

      <div v-if="channel.editMode === `add-existing`">
        <app-labeled-input :formstate="formstate" name="existingChannelUuid" label="Select an existing channel">
          <select
            v-model="channel.uuid"
            name="existingChannelUuid"
            size="10"
            style="width: 100%;"
            required>
            <option
              v-for="channelUuid in currentModeUnchosenChannels"
              :key="channelUuid"
              :value="channelUuid">
              {{ getChannelName(channelUuid) }}
            </option>
          </select>
        </app-labeled-input>

        <p>or <a href="#create-channel" @click.prevent="setEditModeCreate">create a new channel</a></p>
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
            list="channel-name-suggestions"
            title="Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead."
            class="channelName"
            @blur="onChannelNameChanged" />
        </app-labeled-input>

        <datalist id="channel-name-suggestions" hidden>
          <option>Intensity</option>
          <option>Dimmer</option>
          <option>Shutter / Strobe</option>
          <option>Shutter</option>
          <option>Strobe</option>
          <option>Strobe Speed</option>
          <option>Strobe Duration</option>
          <option v-for="color in singleColors" :key="color">{{ color }}</option>
          <option>Color Macros</option>
          <option>Color Presets</option>
          <option>Color Wheel</option>
          <option>Color Wheel Rotation</option>
          <option>Color Temperature</option>
          <option>CTC</option>
          <option>CTO</option>
          <option>CTB</option>
          <option>Pan</option>
          <option>Tilt</option>
          <option>Pan/Tilt Speed</option>
          <option>Pan/Tilt Duration</option>
          <option>Effect Speed</option>
          <option>Program Speed</option>
          <option>Effect Duration</option>
          <option>Program Duration</option>
          <option>Sound Sensitivity</option>
          <option>Gobo Wheel</option>
          <option>Gobo Wheel Rotation</option>
          <option>Gobo Stencil Rotation</option>
          <option>Focus</option>
          <option>Zoom</option>
          <option>Iris</option>
          <option>Frost</option>
          <option>Prism</option>
          <option>Prism Rotation</option>
          <option>Blade Insertion</option>
          <option>Blade Rotation</option>
          <option>Blade System Rotation</option>
          <option>Fog</option>
          <option>Haze</option>
          <option>Fog Output</option>
          <option>Fog Intensity</option>
          <option>No function</option>
          <option>Reserved</option>
        </datalist>

        <app-labeled-input :formstate="formstate" name="resolution" label="Channel resolution">
          <select v-model="channel.resolution" name="resolution">
            <option :value="Constants.RESOLUTION_8BIT">8 bit (No fine channels)</option>
            <option :value="Constants.RESOLUTION_16BIT">16 bit (1 fine channel)</option>
            <option :value="Constants.RESOLUTION_24BIT">24 bit (2 fine channels)</option>
          </select>
        </app-labeled-input>

        <app-labeled-input
          v-if="channel.resolution > Constants.RESOLUTION_8BIT"
          :formstate="formstate"
          name="dmxValueResolution"
          label="DMX value resolution">
          <select
            v-model="channel.dmxValueResolution"
            name="dmxValueResolution"
            required
            @change="onDmxValueResolutionChanged">
            <option :value="Constants.RESOLUTION_8BIT">8 bit (range 0…255)</option>
            <option v-if="channel.resolution >= Constants.RESOLUTION_16BIT" :value="Constants.RESOLUTION_16BIT">16 bit (range 0…65535)</option>
            <option v-if="channel.resolution >= Constants.RESOLUTION_24BIT" :value="Constants.RESOLUTION_24BIT">24 bit (range 0…16777215)</option>
          </select>
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="defaultValue" label="Default DMX value">
          <app-property-input-entity
            v-model="channel.defaultValue"
            :schema-property="properties.channel.defaultValue"
            :max-number="dmxMax"
            class="wide"
            name="defaultValue" />
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

        <app-editor-capability-wizard
          v-if="channel.wizard.show"
          :wizard="channel.wizard"
          :capabilities="channel.capabilities"
          :resolution="capResolution"
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
            :resolution="capResolution"
            @insert-capability-before="insertEmptyCapability(index)"
            @insert-capability-after="insertEmptyCapability(index + 1)" />
        </div>

        <section>
          <a href="#wizard" class="button secondary" @click.prevent="setWizardVisibility(!channel.wizard.show)">
            <app-svg name="capability-wizard" />
            {{ channel.wizard.show ? 'Close' : 'Open' }} Capability Wizard
          </a>
        </section>

        <h3>Advanced channel settings</h3>

        <app-labeled-input :formstate="formstate" name="highlightValue" label="Highlight DMX value">
          <app-property-input-entity
            v-model="channel.highlightValue"
            :schema-property="properties.channel.highlightValue"
            :max-number="dmxMax"
            class="wide"
            name="highlightValue" />
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
        <button :disabled="channel.wizard.show" type="submit" class="primary">{{ submitButtonTitle }}</button>
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

  .existingChannelUuid {
    display: block;
  }
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
  Constants,
  getEmptyCapability,
  getEmptyFineChannel,
  getSanitizedChannel,
  isChannelChanged,
  isCapabilityChanged,
  clone
} from '~/assets/scripts/editor-utils.mjs';

import a11yDialogVue from '~/components/a11y-dialog.vue';
import editorCapabilityVue from '~/components/editor-capability.vue';
import editorCapabilityWizardVue from '~/components/editor-capability-wizard.vue';
import labeledInputVue from '~/components/labeled-input.vue';
import propertyInputBooleanVue from '~/components/property-input-boolean.vue';
import propertyInputEntityVue from '~/components/property-input-entity.vue';
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
    'app-property-input-entity': propertyInputEntityVue,
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
      properties: schemaProperties,
      Constants
    };
  },
  computed: {
    capResolution() {
      return Math.min(this.channel.resolution, this.channel.dmxValueResolution);
    },
    dmxMax() {
      return Math.pow(256, this.capResolution) - 1;
    },
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

          const maxFoundResolution = Math.max(Constants.RESOLUTION_8BIT, ...otherFineChannels.map(
            ch => ch.resolution
          ));

          if (maxFoundResolution !== channel.resolution - 1) {
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
    },
    areCapabilitiesChanged() {
      return this.channel.capabilities.some(isCapabilityChanged);
    },
    submitButtonTitle() {
      if (this.channel.editMode === `add-existing`) {
        return `Add channel`;
      }

      if (this.channel.editMode === `create`) {
        return `Create channel`;
      }

      return `Save changes`;
    },
    singleColors() {
      return this.properties.capabilityTypes.ColorIntensity.properties.color.enum;
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
      else if (this.channel.editMode === `add-existing`) {
        this.channel.uuid = ``;
      }
      else if (this.channel.editMode === `edit-all` || this.channel.editMode === `edit-duplicate`) {
        const channel = this.fixture.availableChannels[this.channel.uuid];
        Object.keys(channel).forEach(prop => {
          this.channel[prop] = clone(channel[prop]);
        });
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

    onChannelNameChanged(channelName) {
      if (this.areCapabilitiesChanged) {
        return;
      }

      const cap = this.channel.capabilities[0];
      const changeCapabilityType = this.$refs.capabilities[0].$refs.capabilityTypeData.changeCapabilityType;

      const matchingColor = this.singleColors.find(
        color => channelName.toLowerCase().includes(color.toLowerCase())
      );
      if (matchingColor) {
        cap.type = `ColorIntensity`;
        cap.typeData.color = matchingColor;
        changeCapabilityType();
        return;
      }

      const capabilityTypeSuggestions = {
        NoFunction: /^(?:No function|Nothing|Reserved)$/i,
        StrobeSpeed: /^(?:Strobe Speed|Strobe Rate)$/i,
        StrobeDuration: /^(?:Strobe Duration|Flash Duration)$/i,
        Intensity: /^(?:Intensity|Dimmer|Master Dimmer)$/i,
        ColorTemperature: /^(?:Colou?r Temperature(?: Correction)?|CTC|CTO|CTB)$/i,
        Pan: /^(?:Pan|Horizontal Movement)$/i,
        Tilt: /^(?:Tilt|Vertical Movement)$/i,
        PanTiltSpeed: /^(?:Pan\/?Tilt|Movement) (?:Speed|Time|Duration)$/i,
        EffectSpeed: /^(?:Effect|Program|Macro) Speed$/i,
        EffectDuration: /^(?:Effect|Program|Macro) (?:Time|Duration)$/i,
        SoundSensitivity: /^(?:Sound|Mic|Microphone) Sensitivity$/i,
        Focus: /^Focus$/i,
        Zoom: /^Zoom$/i,
        Iris: /^Iris$/i,
        Frost: /^Frost$/i,
        Fog: /^(?:Fog|Haze)$/i,
        FogOutput: /^(?:Fog (?:Output|Intensity|Emission)|Pump)$/i,
        Speed: /^.*?Speed$/i,
        Time: /^.*?(?:Time|Duration)$/i
      };

      const matchingType = Object.keys(capabilityTypeSuggestions).find(
        type => capabilityTypeSuggestions[type].test(channelName)
      );

      if (matchingType) {
        cap.type = matchingType;
        changeCapabilityType();
      }
    },

    /**
     * Call onEndUpdated() on the last capability component with non-empty
     * DMX end value to add / remove an empty capability at the end.
     */
    onDmxValueResolutionChanged() {
      this.$nextTick(() => {
        let index = this.channel.capabilities.length - 1;
        while (index >= 0) {
          const cap = this.channel.capabilities[index];
          if (cap.dmxRange !== null && cap.dmxRange[1] !== null && !this.channel.wizard.show) {
            this.$refs.capabilities[index].onEndUpdated();
            break;
          }
          index--;
        }
      });
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

      this.addFineChannels(this.channel, Constants.RESOLUTION_16BIT, true);
    },

    saveEditedChannel() {
      const previousResolution = this.fixture.availableChannels[this.channel.uuid].resolution;
      this.fixture.availableChannels[this.channel.uuid] = getSanitizedChannel(this.channel);

      if (previousResolution > this.channel.resolution) {
        for (const chId of Object.keys(this.fixture.availableChannels)) {
          const channel = this.fixture.availableChannels[chId];
          if (channel.coarseChannelId === this.channel.uuid && channel.resolution > this.channel.resolution) {
            this.$emit(`remove-channel`, chId);
          }
        }
      }
      else {
        this.addFineChannels(this.channel, previousResolution + 1, false);
      }
    },

    saveDuplicatedChannel() {
      const oldChannelKey = this.channel.uuid;

      const newChannelKey = uuidV4();
      const newChannel = getSanitizedChannel(this.channel);
      newChannel.uuid = newChannelKey;
      this.$set(this.fixture.availableChannels, newChannelKey, newChannel);

      const fineChannelUuids = this.addFineChannels(newChannel, Constants.RESOLUTION_16BIT, false);

      this.currentMode.channels = this.currentMode.channels.map(key => {
        if (key === oldChannelKey) {
          return newChannelKey;
        }

        // map each old fine channel to the new fine channel
        const oldFineChannel = this.fixture.availableChannels[key];
        if (oldFineChannel.coarseChannelId === oldChannelKey) {
          return fineChannelUuids[oldFineChannel.resolution];
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
     * @param {!number} offset At which resolution should be started.
     * @param {boolean} [addToMode] If true, the fine channel is pushed to the current mode's channels.
     * @returns {!Array.<string>} Array of added fine channel UUIDs (at the index of their resolution).
     */
    addFineChannels(coarseChannel, offset, addToMode) {
      const addedFineChannelUuids = [];

      for (let i = offset; i <= coarseChannel.resolution; i++) {
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

    /**
     * @param {boolean} show Whether to show or hide the Capability Wizard.
     */
    setWizardVisibility(show) {
      this.channel.wizard.show = show;

      if (!show) {
        this.onDmxValueResolutionChanged(); // maybe DMX value resolution has been changed while wizard was open
      }
    },

    onWizardClose(insertIndex) {
      this.setWizardVisibility(false);

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
