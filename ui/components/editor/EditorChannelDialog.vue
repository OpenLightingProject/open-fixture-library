<template>
  <A11yDialog
    id="channel-dialog"
    ref="channelDialog"
    :shown="channel.editMode !== `` && channel.editMode !== `edit-?`"
    :title="title"
    :class="`channel-dialog-${channel.editMode}`"
    @show="onChannelDialogOpen()"
    @hide="onChannelDialogClose()">

    <VueForm
      :state="formstate"
      action="#"
      @submit.prevent="onSubmit()">

      <div v-if="channel.editMode === `add-existing`" class="existing-channel-input-container">
        <LabeledInput
          :formstate="formstate"
          name="existingChannelUuid"
          label="Select existing channel(s)"
          multiple-inputs>
          <input
            :value="selectedChannelUuids.join(',')"
            name="existingChannelUuid"
            type="hidden"
            required>
          <ul class="channel-list" role="listbox" :aria-multiselectable="true">
            <li
              v-for="item of currentModeUnchosenChannels"
              :key="item.uuid"
              role="option"
              class="channel-list-item"
              :aria-selected="item.isSelected ? 'true' : 'false'">
              <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- double click is just a shortcut, all functionality is still accessible via keyboard -->
              <label
                :for="item.inputId"
                class="channel-list-label"
                @dblclick="onChannelDoubleClick(item.uuid)">
                <input
                  :id="item.inputId"
                  :checked="item.isSelected"
                  type="checkbox"
                  class="channel-checkbox"
                  @change="toggleChannelSelection(item.uuid)">
                <span class="channel-name">{{ item.name }}</span>
                <code v-if="item.showUuid" class="channel-uuid">{{ item.uuid }}</code>
              </label>
            </li>
          </ul>
        </LabeledInput>

        <p>or <a href="#create-channel" @click.prevent="setEditModeCreate()">create a new channel</a></p>
      </div>

      <div v-else>
        <LabeledInput :formstate="formstate" name="name" label="Name">
          <PropertyInputText
            v-model="channel.name"
            :schema-property="channelProperties.name"
            required
            name="name"
            start-with-uppercase-or-number
            no-fine-channel-name
            list="channel-name-suggestions"
            title="Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead."
            class="channelName"
            @blur="onChannelNameChanged($event)" />
        </LabeledInput>

        <datalist id="channel-name-suggestions" hidden>
          <option>Intensity</option>
          <option>Dimmer</option>
          <option>Shutter / Strobe</option>
          <option>Shutter</option>
          <option>Strobe</option>
          <option>Strobe Speed</option>
          <option>Strobe Duration</option>
          <option v-for="color of singleColors" :key="color">{{ color }}</option>
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

        <LabeledInput :formstate="formstate" name="resolution" label="Channel resolution">
          <!-- eslint-disable-next-line vuejs-accessibility/no-onchange -- @change is fine here, as the action is non-destructive -->
          <select v-model="channel.resolution" name="resolution" @change="onResolutionChanged()">
            <option :value="constants.RESOLUTION_8BIT">8 bit (No fine channels)</option>
            <option :value="constants.RESOLUTION_16BIT">16 bit (1 fine channel)</option>
            <option :value="constants.RESOLUTION_24BIT">24 bit (2 fine channels)</option>
          </select>
        </LabeledInput>

        <LabeledInput
          v-if="channel.resolution > constants.RESOLUTION_8BIT"
          :formstate="formstate"
          name="dmxValueResolution"
          label="DMX value resolution">
          <!-- eslint-disable-next-line vuejs-accessibility/no-onchange -- @change is fine here, as the action is non-destructive -->
          <select
            v-model="channel.dmxValueResolution"
            name="dmxValueResolution"
            required
            @change="onDmxValueResolutionChanged()">
            <option :value="constants.RESOLUTION_8BIT">8 bit (range 0…255)</option>
            <option v-if="channel.resolution >= constants.RESOLUTION_16BIT" :value="constants.RESOLUTION_16BIT">16 bit (range 0…65535)</option>
            <option v-if="channel.resolution >= constants.RESOLUTION_24BIT" :value="constants.RESOLUTION_24BIT">24 bit (range 0…16777215)</option>
          </select>
        </LabeledInput>

        <LabeledInput
          :formstate="formstate"
          multiple-inputs
          name="defaultValue"
          label="Default DMX value">
          <PropertyInputEntity
            v-model="channel.defaultValue"
            :schema-property="channelProperties.defaultValue"
            :min-number="0"
            :max-number="(typeof channel.defaultValue) === `string` ? 100 : dmxMax"
            wide
            name="defaultValue" />
        </LabeledInput>

        <h3>Capabilities<template v-if="!channel.wizard.show && channel.capabilities.length > 1">
          <button
            type="button"
            class="icon-button expand-all"
            title="Expand all channels"
            @click.prevent="openDetails()">
            <OflSvg name="chevron-double-down" />
          </button>
          <button
            type="button"
            class="icon-button collapse-all"
            title="Collapse all channels"
            @click.prevent="closeDetails()">
            <OflSvg name="chevron-double-up" />
          </button>
        </template></h3>

        <EditorCapabilityWizard
          v-if="channel.wizard.show"
          :wizard="channel.wizard"
          :channel="channel"
          :resolution="channel.dmxValueResolution"
          @close="onWizardClose($event)" />

        <div v-else class="capability-editor">
          <EditorCapability
            v-for="(cap, index) of channel.capabilities"
            ref="capabilities"
            :key="cap.uuid"
            :channel="channel"
            :formstate="formstate"
            :capability-index="index"
            :resolution="channel.dmxValueResolution"
            @insert-capability-before="insertEmptyCapability(index)"
            @insert-capability-after="insertEmptyCapability(index + 1)" />
        </div>

        <section>
          <a href="#wizard" class="button secondary" @click.prevent="setWizardVisibility(!channel.wizard.show)">
            <OflSvg name="capability-wizard" />
            {{ channel.wizard.show ? 'Close' : 'Open' }} Capability Wizard
          </a>
        </section>

        <h3>Advanced channel settings</h3>

        <LabeledInput
          :formstate="formstate"
          multiple-inputs
          name="highlightValue"
          label="Highlight DMX value">
          <PropertyInputEntity
            v-model="channel.highlightValue"
            :schema-property="channelProperties.highlightValue"
            :min-number="0"
            :max-number="(typeof channel.highlightValue) === `string` ? 100 : dmxMax"
            wide
            name="highlightValue" />
        </LabeledInput>

        <LabeledInput :formstate="formstate" name="constant" label="Constant?">
          <PropertyInputBoolean
            v-model="channel.constant"
            name="constant"
            label="Channel is fixed to default DMX value" />
        </LabeledInput>

        <LabeledInput :formstate="formstate" name="precedence" label="Precedence">
          <PropertyInputSelect
            v-model="channel.precedence"
            :schema-property="channelProperties.precedence"
            name="precedence" />
        </LabeledInput>

      </div>

      <div class="button-bar right">
        <button :disabled="channel.wizard.show" type="submit" class="primary">{{ submitButtonTitle }}</button>
      </div>

    </VueForm>

  </A11yDialog>
</template>

<style lang="scss" scoped>
.expand-all,
.collapse-all {
  margin-left: 1ex;
  font-size: 0.8rem;
}

.existing-channel-input-container ::v-deep section {
  display: block;
}

.channel-list {
  max-height: 400px;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  list-style: none;
  background-color: theme-color(card-background);
  border: 1px solid theme-color(text-secondary);
  border-radius: 2px;
}

.channel-list-item {
  border-bottom: 1px solid theme-color(divider);
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &[aria-selected="true"] {
    background-color: theme-color(active-background);
  }
}

.channel-list-label {
  display: flex;
  gap: 1ex;
  align-items: center;
  padding: 0.5ex 2ex;
  cursor: pointer;
}

.channel-checkbox {
  flex-shrink: 0;
  margin: 0;
  cursor: pointer;
}

.channel-uuid {
  font-size: 0.85em;
  color: theme-color(text-secondary);
}

@media (min-width: $phone) {
  #channel-dialog ::v-deep .dialog {
    width: 80%;
    max-width: 700px;
  }
}
</style>

<script>
import scrollIntoView from 'scroll-into-view';
import { v4 as uuidv4 } from 'uuid';

import { objectProp } from 'vue-ts-types';
import { capabilityTypes, channelProperties } from '../../../lib/schema-properties.js';
import {
  constants,
  getEmptyCapability,
  getEmptyFineChannel,
  getEmptyFormState,
  getSanitizedChannel,
  isCapabilityChanged,
  isChannelChanged,
} from '../../assets/scripts/editor-utilities.js';

import A11yDialog from '../A11yDialog.vue';
import LabeledInput from '../LabeledInput.vue';
import PropertyInputBoolean from '../PropertyInputBoolean.vue';
import PropertyInputEntity from '../PropertyInputEntity.vue';
import PropertyInputSelect from '../PropertyInputSelect.vue';
import PropertyInputText from '../PropertyInputText.vue';
import EditorCapability from './EditorCapability.vue';
import EditorCapabilityWizard from './EditorCapabilityWizard.vue';

export default {
  components: {
    A11yDialog,
    EditorCapability,
    EditorCapabilityWizard,
    LabeledInput,
    PropertyInputBoolean,
    PropertyInputEntity,
    PropertyInputSelect,
    PropertyInputText,
  },
  props: {
    channel: objectProp().required,
    fixture: objectProp().required,
  },
  emits: {
    'channel-changed': () => true,
    'remove-channel': channelId => true,
    'reset-channel': () => true,
  },
  data() {
    return {
      formstate: getEmptyFormState(),
      restored: false,
      channelChanged: false,
      channelProperties,
      singleColors: capabilityTypes.ColorIntensity.properties.color.enum,
      constants,
      selectedChannelUuids: [],
    };
  },
  computed: {
    dmxMax() {
      return Math.pow(256, this.channel.dmxValueResolution) - 1;
    },
    currentMode() {
      const uuid = this.channel.modeId;
      const modeIndex = this.fixture.modes.findIndex(mode => mode.uuid === uuid);
      return this.fixture.modes[modeIndex];
    },
    currentModeUnchosenChannelUuids() {
      return Object.keys(this.fixture.availableChannels).filter(
        channelUuid => !this.currentMode.channels.includes(channelUuid),
      );
    },
    currentModeUnchosenChannels() {
      return this.currentModeUnchosenChannelUuids.map(channelUuid => ({
        inputId: `unchosen-channel-${channelUuid}`,
        uuid: channelUuid,
        name: this.getChannelName(channelUuid),
        showUuid: !this.isChannelNameUnique(channelUuid),
        isSelected: this.isChannelSelected(channelUuid),
      }));
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
      return this.channel.capabilities.some(
        capability => isCapabilityChanged(capability),
      );
    },
    submitButtonTitle() {
      if (this.channel.editMode === `add-existing`) {
        const count = this.selectedChannelUuids.length;
        return count <= 1 ? `Add channel` : `Add ${count} channels`;
      }

      if (this.channel.editMode === `create`) {
        return `Create channel`;
      }

      return `Save changes`;
    },
  },
  watch: {
    channel: {
      handler() {
        if (isChannelChanged(this.channel)) {
          this.$emit(`channel-changed`);
          this.channelChanged = true;
        }
      },
      deep: true,
    },
  },
  methods: {
    setEditModeCreate() {
      this.channel.editMode = `create`;
      this.channel.uuid = uuidv4();
    },

    getChannelName(channelUuid) {
      const fixtureEditor = this.$parent;
      return fixtureEditor.getChannelName(channelUuid);
    },

    isChannelNameUnique(channelUuid) {
      const fixtureEditor = this.$parent;
      return fixtureEditor.isChannelNameUnique(channelUuid);
    },

    isChannelSelected(channelUuid) {
      return this.selectedChannelUuids.includes(channelUuid);
    },

    modeHasChannel(channelUuid) {
      return this.currentMode.channels.includes(channelUuid);
    },

    toggleChannelSelection(channelUuid) {
      if (this.isChannelSelected(channelUuid)) {
        this.deselectChannel(channelUuid);
      }
      else {
        this.selectChannel(channelUuid);
      }

      this.channelChanged = true;
    },

    deselectChannel(channelUuid) {
      const deselectedChannel = this.fixture.availableChannels[channelUuid];
      const isFineChannel = `coarseChannelId` in deselectedChannel;

      // Deselect the channel
      this.selectedChannelUuids = this.selectedChannelUuids.filter(uuid => uuid !== channelUuid);

      if (isFineChannel) {
        // Deselect all finer channels
        this.selectedChannelUuids = this.selectedChannelUuids.filter(uuid => {
          const channel = this.fixture.availableChannels[uuid];
          return (
            !(`coarseChannelId` in channel) ||
            channel.coarseChannelId !== deselectedChannel.coarseChannelId ||
            channel.resolution < deselectedChannel.resolution
          );
        });
        return;
      }

      // Deselect all fine channels belonging to this coarse channel
      this.selectedChannelUuids = this.selectedChannelUuids.filter(uuid => {
        const channel = this.fixture.availableChannels[uuid];
        return !(`coarseChannelId` in channel) || channel.coarseChannelId !== channelUuid;
      });
    },

    selectChannel(channelUuid) {
      if (this.isChannelSelected(channelUuid)) {
        return;
      }

      const selectedChannel = this.fixture.availableChannels[channelUuid];
      const isFineChannel = `coarseChannelId` in selectedChannel;

      if (!isFineChannel) {
        this.selectedChannelUuids.push(channelUuid);
        return;
      }

      // Add the coarse channel if not already selected
      const coarseChannelId = selectedChannel.coarseChannelId;
      if (!this.isChannelSelected(coarseChannelId) && !this.modeHasChannel(coarseChannelId)) {
        this.selectedChannelUuids.push(coarseChannelId);
      }

      // Add all finer channels between coarse and selected fine channel
      const currentResolution = selectedChannel.resolution;
      for (const uuid of this.currentModeUnchosenChannelUuids) {
        const channel = this.fixture.availableChannels[uuid];
        if (
          `coarseChannelId` in channel &&
          channel.coarseChannelId === coarseChannelId &&
          channel.resolution < currentResolution &&
          !this.isChannelSelected(uuid) &&
          !this.modeHasChannel(uuid)
        ) {
          this.selectedChannelUuids.push(uuid);
        }
      }

      this.selectedChannelUuids.push(channelUuid);
    },

    onChannelDoubleClick(channelUuid) {
      // Select the channel if not already selected
      if (!this.isChannelSelected(channelUuid)) {
        this.toggleChannelSelection(channelUuid);
      }

      if (this.selectedChannelUuids.some(uuid => uuid !== channelUuid)) {
        // another channel is already selected, do not submit on double-click
        return;
      }

      this.onSubmit();
    },

    async onChannelDialogOpen() {
      if (this.restored) {
        this.restored = false;
        return;
      }

      if (this.channel.editMode === `add-existing` && this.currentModeUnchosenChannels.length === 0) {
        this.channel.editMode = `create`;
      }
      else if (this.channel.editMode === `add-existing`) {
        this.channel.uuid = ``;
        this.selectedChannelUuids = [];
      }
      else if (this.channel.editMode === `edit-all` || this.channel.editMode === `edit-duplicate`) {
        this.copyPropertiesFromChannel(this.fixture.availableChannels[this.channel.uuid]);
      }

      // after dialog is opened
      await this.$nextTick();
      this.channelChanged = false;
    },

    copyPropertiesFromChannel(channel) {
      for (const property of Object.keys(channel)) {
        this.channel[property] = structuredClone(channel[property]);
      }
    },

    async onChannelDialogClose() {
      if (this.channel.editMode === ``) {
        // saving did already manage everything
        return;
      }

      if (this.channelChanged && !window.confirm(`Do you want to lose the entered channel data?`)) {
        await this.$nextTick();
        this.restored = true;
        this.$refs.channelDialog.show();
        return;
      }

      this.resetChannelForm();
    },

    onChannelNameChanged(channelName) {
      if (this.areCapabilitiesChanged || channelName === ``) {
        return;
      }

      const capability = this.channel.capabilities[0];

      const matchingColor = this.singleColors.find(
        color => channelName.toLowerCase().includes(color.toLowerCase()),
      );
      if (matchingColor) {
        capability.type = `ColorIntensity`;
        capability.typeData.color = matchingColor;
        return;
      }

      const capabilityTypeSuggestions = {
        NoFunction: /^(?:no function|nothing|reserved)$/i,
        StrobeSpeed: /^(?:strobe speed|strobe rate)$/i,
        StrobeDuration: /^(?:strobe duration|flash duration)$/i,
        Intensity: /^(?:intensity|dimmer|master dimmer)$/i,
        ColorTemperature: /^(?:colou?r temperature(?: correction)?|ctc|cto|ctb)$/i,
        Pan: /^(?:pan|horizontal movement)$/i,
        Tilt: /^(?:tilt|vertical movement)$/i,
        PanTiltSpeed: /^(?:pan ?\/? ?tilt|movement) (?:speed|time|duration)$/i,
        WheelShake: /\bshake\b/i,
        WheelSlotRotation: /gobo ?\d* (?:rotation|index)/i,
        WheelRotation: /wheels? ?\d* (?:rotation|index)/i,
        WheelSlot: /wheel|dis[ck]|(?:gobos? ?\d*$)/i,
        EffectSpeed: /^(?:effect|program|macro) speed$/i,
        EffectDuration: /^(?:effect|program|macro) (?:time|duration)$/i,
        SoundSensitivity: /^(?:sound|mic|microphone) sensitivity$/i,
        Focus: /^focus$/i,
        Zoom: /^zoom$/i,
        Iris: /^iris$/i,
        Frost: /^frost$/i,
        Fog: /^(?:fog|haze)$/i,
        FogOutput: /^(?:fog (?:output|intensity|emission)|pump)$/i,
        Speed: /^.*?speed$/i,
        Time: /^.*?(?:time|duration)$/i,
      };

      const matchingType = Object.keys(capabilityTypeSuggestions).find(
        type => capabilityTypeSuggestions[type].test(channelName),
      );

      if (matchingType) {
        capability.type = matchingType;
      }
    },

    onResolutionChanged() {
      if (this.channel.dmxValueResolution > this.channel.resolution) {
        this.channel.dmxValueResolution = this.channel.resolution;
      }
    },

    /**
     * Call onEndUpdated() on the last capability component with non-empty
     * DMX end value to add / remove an empty capability at the end.
     */
    async onDmxValueResolutionChanged() {
      await this.$nextTick();

      let index = this.channel.capabilities.length - 1;
      while (index >= 0) {
        const capability = this.channel.capabilities[index];
        if (capability.dmxRange !== null && capability.dmxRange[1] !== null && !this.channel.wizard.show) {
          this.$refs.capabilities[index].onEndUpdated();
          break;
        }
        index--;
      }
    },

    onSubmit() {
      if (this.channel.wizard.show) {
        return;
      }

      if (this.formstate.$invalid) {
        const invalidFields = document.querySelectorAll(`#channel-dialog .vf-field-invalid`);

        for (let index = 0; index < invalidFields.length; index++) {
          const enclosingDetails = invalidFields[index].closest(`details:not([open])`);

          if (enclosingDetails) {
            enclosingDetails.open = true;

            // current field could be enclosed another time, so repeat
            index--;
          }
        }

        const scrollContainer = invalidFields[0].closest(`.dialog`);
        scrollIntoView(invalidFields[0], {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100,
          },
          isScrollable: target => target === scrollContainer,
        }, () => invalidFields[0].focus());

        return;
      }

      for (const capability of this.$refs.capabilities) {
        capability.cleanCapabilityData();
      }

      const actions = {
        'create': this.saveCreatedChannel,
        'edit-all': this.saveEditedChannel,
        'edit-duplicate': this.saveDuplicatedChannel,
        'add-existing': this.addExistingChannel,
      };

      if (this.channel.editMode in actions) {
        actions[this.channel.editMode]();
      }

      this.resetChannelForm();
    },

    saveCreatedChannel() {
      this.$set(this.fixture.availableChannels, this.channel.uuid, getSanitizedChannel(this.channel));
      this.currentMode.channels.push(this.channel.uuid);

      this.addFineChannels(this.channel, constants.RESOLUTION_16BIT, true);
    },

    saveEditedChannel() {
      const previousResolution = this.fixture.availableChannels[this.channel.uuid].resolution;
      this.fixture.availableChannels[this.channel.uuid] = getSanitizedChannel(this.channel);

      if (previousResolution > this.channel.resolution) {
        for (const channelId of Object.keys(this.fixture.availableChannels)) {
          const channel = this.fixture.availableChannels[channelId];
          if (channel.coarseChannelId === this.channel.uuid && channel.resolution > this.channel.resolution) {
            this.$emit(`remove-channel`, channelId);
          }
        }
      }
      else {
        this.addFineChannels(this.channel, previousResolution + 1, false);
      }
    },

    saveDuplicatedChannel() {
      const oldChannelKey = this.channel.uuid;

      const newChannelKey = uuidv4();
      const newChannel = getSanitizedChannel(this.channel);
      newChannel.uuid = newChannelKey;
      this.$set(this.fixture.availableChannels, newChannelKey, newChannel);

      const fineChannelUuids = this.addFineChannels(newChannel, constants.RESOLUTION_16BIT, false);

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
      for (const channelUuid of this.selectedChannelUuids) {
        if (!this.modeHasChannel(channelUuid)) {
          this.currentMode.channels.push(channelUuid);
        }
      }

      // Reset selection
      this.selectedChannelUuids = [];
    },

    /**
     * @param {object} coarseChannel The channel object of the coarse channel.
     * @param {number} offset At which resolution should be started.
     * @param {boolean} [addToMode] If true, the fine channel is pushed to the current mode's channels.
     * @returns {string[]} Array of added fine channel UUIDs (at the index of their resolution).
     */
    addFineChannels(coarseChannel, offset, addToMode) {
      const addedFineChannelUuids = [];

      for (let index = offset; index <= coarseChannel.resolution; index++) {
        const fineChannel = getEmptyFineChannel(coarseChannel.uuid, index);
        this.$set(this.fixture.availableChannels, fineChannel.uuid, getSanitizedChannel(fineChannel));
        addedFineChannelUuids[index] = fineChannel.uuid;

        if (addToMode) {
          this.currentMode.channels.push(fineChannel.uuid);
        }
      }

      return addedFineChannelUuids;
    },

    async resetChannelForm() {
      this.$emit(`reset-channel`);

      await this.$nextTick();
      this.formstate._reset(); // resets validation status
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

    async onWizardClose(insertIndex) {
      this.setWizardVisibility(false);

      await this.$nextTick();
      const firstNewCapability = this.$refs.capabilities[insertIndex];
      const scrollContainer = firstNewCapability.$el.closest(`.dialog`);

      scrollIntoView(firstNewCapability.$el, {
        time: 0,
        align: {
          top: 0,
          left: 0,
          topOffset: 100,
        },
        isScrollable: target => target === scrollContainer,
      }, () => firstNewCapability.focus());
    },

    openDetails() {
      for (const details of this.$el.querySelectorAll(`details`)) {
        details.open = true;
      }
    },

    closeDetails() {
      for (const details of this.$el.querySelectorAll(`details`)) {
        details.open = false;
      }
    },

    insertEmptyCapability(index) {
      this.channel.capabilities.splice(index, 0, getEmptyCapability());
    },
  },
};
</script>
