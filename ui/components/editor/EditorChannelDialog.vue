<template>
  <A11yDialog
    id="channel-dialog"
    ref="channelDialog"
    :shown="channel.editMode !== `` && channel.editMode !== `edit-?`"
    :title="title"
    :class="`channel-dialog-${channel.editMode}`"
    @show="onChannelDialogOpen()"
    @hide="onChannelDialogClose()">

    <form
      action="#"
      novalidate
      @submit.prevent="onSubmit()">

      <div v-if="channel.editMode === `add-existing`" class="existing-channel-input-container">
        <LabeledInput
          :formstate="formstate"
          name="existingChannelUuid"
          multiple-inputs>
          <input
            v-model="selectedChannelUuidsString"
            name="existingChannelUuid"
            type="hidden"
            required>
          <fieldset class="channel-list">
            <legend>Select existing channel(s)</legend>
            <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- double click is just a shortcut, all functionality is still accessible via keyboard -->
            <label
              v-for="item of currentModeUnchosenChannels"
              :key="item.uuid"
              :for="item.inputId"
              class="channel-list-item"
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
          </fieldset>
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
            :capability-index="Number(index)"
            :resolution="channel.dmxValueResolution"
            @insert-capability-before="insertEmptyCapability(Number(index))"
            @insert-capability-after="insertEmptyCapability(Number(index) + 1)" />
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

    </form>

  </A11yDialog>
</template>

<style lang="scss" scoped>
.expand-all,
.collapse-all {
  margin-left: 1ex;
  font-size: 0.8rem;
}

.existing-channel-input-container :deep(section) {
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

  legend {
    display: block;
    width: calc(100% + 2px);
    padding: 0;
    margin: 0 -1px;
    color: theme-color(text-secondary);
    border-bottom: 1px solid theme-color(text-secondary);
  }
}

.channel-list-item {
  display: flex;
  gap: 1ex;
  align-items: center;
  padding: 0.5ex 2ex;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid theme-color(divider);
  transition: background-color 0.15s;

  &:where(:has(.channel-checkbox:checked)) {
    background-color: theme-color(active-background);
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &:has(.channel-checkbox:focus-visible) {
    background-color: theme-color(hover-background);
  }
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
  #channel-dialog :deep(.dialog) {
    width: 80%;
    max-width: 700px;
  }
}
</style>

<script setup lang="ts">
import scrollIntoView from 'scroll-into-view';
import {
  constants,
  getEmptyCapability,
  getEmptyFineChannel,
  getEmptyFormState,
  getSanitizedChannel,
  isCapabilityChanged,
  isChannelChanged,
  scrollToFirstInvalidField,
  toPlainData,
} from '@/assets/scripts/editor-utilities.js';
import { useEditorForm } from '~/composables/useEditorForm';
import type { EditorChannel, EditorFixture } from '~/types/editor';
import { capabilityTypes, channelProperties } from '~~/lib/schema-properties.js';
import A11yDialog from '../A11yDialog.vue';
import LabeledInput from '../LabeledInput.vue';
import PropertyInputBoolean from '../PropertyInputBoolean.vue';
import PropertyInputEntity from '../PropertyInputEntity.vue';
import PropertyInputSelect from '../PropertyInputSelect.vue';
import PropertyInputText from '../PropertyInputText.vue';
import EditorCapability from './EditorCapability.vue';
import EditorCapabilityWizard from './EditorCapabilityWizard.vue';

interface Properties {
  channel: EditorChannel;
  fixture: EditorFixture;
}

const properties = defineProps<Properties>();
const emit = defineEmits<{
  'channel-changed': [];
  'remove-channel': [channelId: string];
  'reset-channel': [];
}>();

const channelDialog = ref<typeof A11yDialog | null>(null);
const capabilities = ref<typeof EditorCapability[] | null>(null);
const editorForm = useEditorForm();
const formstate = ref(getEmptyFormState());
const restored = ref(false);
const channelChanged = ref(false);
const selectedChannelUuids = ref<string[]>([]);

const dmxMax = computed(() => Math.pow(256, properties.channel.dmxValueResolution) - 1);
const singleColors = capabilityTypes.ColorIntensity.properties.color.enum;

const currentMode = computed(() => {
  const uuid = properties.channel.modeId;
  if (!uuid) {
    return { channels: [], shortName: '', name: '' };
  }
  const modeIndex = properties.fixture.modes.findIndex((mode) => mode.uuid === uuid);
  return properties.fixture.modes[modeIndex] ?? { channels: [], shortName: '', name: '' };
});

const currentModeUnchosenChannelUuids = computed(() => {
  return Object.keys(properties.fixture.availableChannels).filter(
    (channelUuid) => !currentMode.value.channels.includes(channelUuid),
  );
});

const currentModeUnchosenChannels = computed(() => {
  return currentModeUnchosenChannelUuids.value.map((channelUuid) => ({
    inputId: `unchosen-channel-${channelUuid}`,
    uuid: channelUuid,
    name: getChannelName(channelUuid),
    showUuid: !isChannelNameUnique(channelUuid),
    isSelected: isChannelSelected(channelUuid),
  }));
});

const selectedChannelUuidsString = computed(() => selectedChannelUuids.value.join(','));

const currentModeDisplayName = computed(() => {
  let modeName = `#${currentModeIndex.value + 1}`;
  if (currentMode.value.shortName) {
    modeName = `"${currentMode.value.shortName}"`;
  }
  else if (currentMode.value.name) {
    modeName = `"${currentMode.value.name}"`;
  }
  return modeName;
});

const title = computed(() => {
  if (properties.channel.editMode === 'add-existing') {
    return `Add channel to mode ${currentModeDisplayName.value}`;
  }

  if (properties.channel.editMode === 'create') {
    return 'Create new channel';
  }

  return properties.channel.editMode === 'edit-duplicate' ? 'Edit channel duplicate' : 'Edit channel';
});

const areCapabilitiesChanged = computed(() => {
  return properties.channel.capabilities.some(
    (capability) => isCapabilityChanged(capability),
  );
});

const submitButtonTitle = computed(() => {
  if (properties.channel.editMode === 'add-existing') {
    const count = selectedChannelUuids.value.length;
    return count <= 1 ? 'Add channel' : `Add ${count} channels`;
  }

  return properties.channel.editMode === 'create' ? 'Create channel' : 'Save changes';
});

watch(() => properties.channel, () => {
  if (!isChannelChanged(properties.channel)) {
    return;
  }

  emit('channel-changed');
  channelChanged.value = true;
}, { deep: true });

/**
 * Resolves a channel's display name, including fine channel suffixes.
 * @param channelUuid - The channel UUID.
 * @returns The display name.
 */
function getChannelName(channelUuid: string): string {
  const channel = (properties.fixture as any).availableChannels[channelUuid];
  if (!channel) {
    return channelUuid;
  }

  if ('coarseChannelId' in channel) {
    let name = `${getChannelName(channel.coarseChannelId)} fine`;
    if (channel.resolution > constants.RESOLUTION_16BIT) {
      name += `^${channel.resolution - 1}`;
    }

    return name;
  }

  return channel.name ?? channelUuid;
}

/**
 * Checks whether a channel's name is unique within the fixture.
 * @param channelUuid - The channel UUID.
 * @returns Whether the name is unique.
 */
function isChannelNameUnique(channelUuid: string): boolean {
  const channelName = getChannelName(channelUuid);
  const availableChannels = (properties.fixture as any).availableChannels as Record<string, unknown>;

  return Object.keys(availableChannels).every(
    (uuid) => channelName !== getChannelName(uuid) || uuid === channelUuid,
  );
}

/**
 * Switches the dialog to creating a new channel.
 */
function setEditModeCreate() {
  properties.channel.editMode = 'create';
  properties.channel.uuid = crypto.randomUUID();
}

/**
 * Checks whether a channel is selected for adding to the mode.
 * @param channelUuid - The channel UUID.
 * @returns Whether it is selected.
 */
function isChannelSelected(channelUuid: string) {
  return selectedChannelUuids.value.includes(channelUuid);
}

/**
 * Finds the index of the channel's current mode.
 * @returns The mode index, or `-1`.
 */
const currentModeIndex = computed(() => properties.fixture.modes.findIndex((mode) => mode.uuid === properties.channel.modeId));

/**
 * Checks whether the current mode already uses a channel.
 * @param channelUuid - The channel UUID.
 * @returns Whether the mode contains the channel.
 */
function modeHasChannel(channelUuid: string) {
  return currentMode.value.channels.includes(channelUuid);
}

/**
 * Toggles a channel in the multi-select list.
 * @param channelUuid - The channel UUID.
 */
function toggleChannelSelection(channelUuid: string) {
  if (isChannelSelected(channelUuid)) {
    deselectChannel(channelUuid);
  }
  else {
    selectChannel(channelUuid);
  }

  channelChanged.value = true;
}

/**
 * Removes a channel from the selection.
 * @param channelUuid - The channel UUID.
 */
function deselectChannel(channelUuid: string) {
  const deselectedChannel = properties.fixture.availableChannels[channelUuid];
  const isFineChannel = 'coarseChannelId' in deselectedChannel;

  selectedChannelUuids.value = selectedChannelUuids.value.filter((uuid) => uuid !== channelUuid);

  if (isFineChannel) {
    selectedChannelUuids.value = selectedChannelUuids.value.filter((uuid) => {
      const channel = properties.fixture.availableChannels[uuid];
      return (
        !('coarseChannelId' in channel)
        || channel.coarseChannelId !== deselectedChannel.coarseChannelId
        || channel.resolution < deselectedChannel.resolution
      );
    });
    return;
  }

  selectedChannelUuids.value = selectedChannelUuids.value.filter((uuid) => {
    const channel = properties.fixture.availableChannels[uuid];
    return !('coarseChannelId' in channel) || channel.coarseChannelId !== channelUuid;
  });
}

/**
 * Adds a channel to the selection.
 * @param channelUuid - The channel UUID.
 */
function selectChannel(channelUuid: string) {
  if (isChannelSelected(channelUuid)) {
    return;
  }

  const selectedChannel = properties.fixture.availableChannels[channelUuid];
  const isFineChannel = 'coarseChannelId' in selectedChannel;

  if (!isFineChannel) {
    selectedChannelUuids.value.push(channelUuid);
    return;
  }

  const coarseChannelId = selectedChannel.coarseChannelId;
  if (!isChannelSelected(coarseChannelId) && !modeHasChannel(coarseChannelId)) {
    selectedChannelUuids.value.push(coarseChannelId);
  }

  const currentResolution = selectedChannel.resolution;
  for (const uuid of currentModeUnchosenChannelUuids.value) {
    const channel = properties.fixture.availableChannels[uuid];
    if (
      'coarseChannelId' in channel
      && channel.coarseChannelId === coarseChannelId
      && channel.resolution < currentResolution
      && !isChannelSelected(uuid)
      && !modeHasChannel(uuid)
    ) {
      selectedChannelUuids.value.push(uuid);
    }
  }

  selectedChannelUuids.value.push(channelUuid);
}

/**
 * Selects a channel and submits the dialog on double click.
 * @param channelUuid - The channel UUID.
 */
async function onChannelDoubleClick(channelUuid: string) {
  if (!isChannelSelected(channelUuid)) {
    toggleChannelSelection(channelUuid);
  }

  if (selectedChannelUuids.value.some((uuid) => uuid !== channelUuid)) {
    return;
  }

  await nextTick();
  onSubmit();
}

/**
 * Prepares the dialog state each time it is shown.
 */
async function onChannelDialogOpen() {
  if (restored.value) {
    restored.value = false;
    return;
  }

  if (properties.channel.editMode === 'add-existing' && currentModeUnchosenChannels.value.length === 0) {
    properties.channel.editMode = 'create';
  }
  else if (properties.channel.editMode === 'add-existing') {
    properties.channel.uuid = '';
    selectedChannelUuids.value = [];
  }
  else if (properties.channel.editMode === 'edit-all' || properties.channel.editMode === 'edit-duplicate') {
    copyPropertiesFromChannel(properties.fixture.availableChannels[properties.channel.uuid]);
  }

  await nextTick();
  channelChanged.value = false;
}

/**
 * Copies channel data into the dialog's working channel.
 * @param channel - The channel to copy from.
 */
function copyPropertiesFromChannel(channel: EditorChannel) {
  for (const [property, value] of Object.entries(channel)) {
    (properties.channel as any)[property] = toPlainData(value);
  }
}

/**
 * Discards or confirms unsaved channel changes when the dialog closes.
 */
async function onChannelDialogClose() {
  if (properties.channel.editMode === '') {
    return;
  }

  if (channelChanged.value && !window.confirm('Do you want to lose the entered channel data?')) {
    await nextTick();
    restored.value = true;
    channelDialog.value?.show();
    return;
  }

  resetChannelForm();
}

/**
 * Prefills capability data when the channel name implies a capability type.
 * @param channelName - The new channel name.
 */
function onChannelNameChanged(channelName: string) {
  if (channelName === '' || areCapabilitiesChanged.value) {
    return;
  }

  const capability = properties.channel.capabilities[0];

  const matchingColor = capabilityTypes.ColorIntensity.properties.color.enum.find(
    (color) => channelName.toLowerCase().includes(color.toLowerCase()),
  );
  if (matchingColor) {
    capability.type = 'ColorIntensity';
    capability.typeData.color = matchingColor;
    return;
  }

  const capabilityTypeSuggestions: Record<string, RegExp> = {
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
    (type) => capabilityTypeSuggestions[type].test(channelName),
  );

  if (matchingType) {
    capability.type = matchingType;
  }
}

/**
 * Updates the channel's fine channels after its resolution changes.
 */
function onResolutionChanged() {
  if (properties.channel.dmxValueResolution > properties.channel.resolution) {
    properties.channel.dmxValueResolution = properties.channel.resolution;
  }
}

/**
 * Adjusts the capability DMX ranges after the value resolution changes.
 */
async function onDmxValueResolutionChanged() {
  await nextTick();

  let index = properties.channel.capabilities.length - 1;
  while (index >= 0) {
    const capability = properties.channel.capabilities[index];
    if (capability.dmxRange !== null && capability.dmxRange[1] !== null && !properties.channel.wizard.show) {
      capabilities.value?.[index]?.onEndUpdated();
      break;
    }
    index--;
  }
}

/**
 * Validates the form and applies the selected edit action.
 */
async function onSubmit() {
  if (properties.channel.wizard.show) {
    return;
  }

  const { valid } = await editorForm.submit();
  if (!valid) {
    scrollToFirstInvalidField(document.querySelector('#channel-dialog') ?? document);
    return;
  }

  const currentCapabilities = capabilities.value ?? [];
  for (const capability of currentCapabilities) {
    capability.cleanCapabilityData();
  }

  const actions: Record<string, () => void> = {
    'create': saveCreatedChannel,
    'edit-all': saveEditedChannel,
    'edit-duplicate': saveDuplicatedChannel,
    'add-existing': addExistingChannel,
  };

  if (properties.channel.editMode in actions) {
    actions[properties.channel.editMode]();
  }

  resetChannelForm();
}

/**
 * Stores a newly created channel in the fixture.
 */
function saveCreatedChannel() {
  (properties.fixture.availableChannels as any)[properties.channel.uuid] = getSanitizedChannel(properties.channel);
  currentMode.value.channels.push(properties.channel.uuid);

  addFineChannels(properties.channel, constants.RESOLUTION_16BIT, true);
}

/**
 * Applies the edited channel to all channels sharing its UUID.
 */
function saveEditedChannel() {
  const previousResolution = properties.fixture.availableChannels[properties.channel.uuid].resolution;
  properties.fixture.availableChannels[properties.channel.uuid] = getSanitizedChannel(properties.channel);

  if (previousResolution > properties.channel.resolution) {
    for (const [channelId, channel] of Object.entries(properties.fixture.availableChannels)) {
      if (channel.coarseChannelId === properties.channel.uuid && channel.resolution > properties.channel.resolution) {
        emit('remove-channel', channelId);
      }
    }
  }
  else {
    addFineChannels(properties.channel, previousResolution + 1, false);
  }
}

/**
 * Stores the edited channel as a copy with a new UUID.
 */
function saveDuplicatedChannel() {
  const oldChannelKey = properties.channel.uuid;

  const newChannelKey = crypto.randomUUID();
  const newChannel = getSanitizedChannel(properties.channel);
  newChannel.uuid = newChannelKey;
  (properties.fixture.availableChannels as any)[newChannelKey] = newChannel;

  const fineChannelUuids = addFineChannels(newChannel, constants.RESOLUTION_16BIT, false);

  currentMode.value.channels = currentMode.value.channels.map((key) => {
    if (key === oldChannelKey) {
      return newChannelKey;
    }

    const oldFineChannel = properties.fixture.availableChannels[key];
    return oldFineChannel.coarseChannelId === oldChannelKey ? fineChannelUuids[oldFineChannel.resolution] : key;
  });
}

/**
 * Adds the selected existing channels to the current mode.
 */
function addExistingChannel() {
  for (const channelUuid of selectedChannelUuids.value) {
    if (!modeHasChannel(channelUuid)) {
      currentMode.value.channels.push(channelUuid);
    }
  }

  selectedChannelUuids.value = [];
}

/**
 * Creates the fine channels for a coarse channel.
 * @param coarseChannel - The coarse channel data.
 * @param offset - The starting fine channel index.
 * @param shouldAddToMode - Whether the new channels join the current mode.
 * @returns The created fine channel UUIDs.
 */
function addFineChannels(coarseChannel: object, offset: number, shouldAddToMode: boolean) {
  const addedFineChannelUuids: string[] = [];

  for (let index = offset; index <= (coarseChannel as any).resolution; index++) {
    const fineChannel = getEmptyFineChannel((coarseChannel as any).uuid, index);
    (properties.fixture.availableChannels as any)[fineChannel.uuid] = getSanitizedChannel(fineChannel);
    addedFineChannelUuids[index] = fineChannel.uuid;

    if (shouldAddToMode) {
      currentMode.value.channels.push(fineChannel.uuid);
    }
  }

  return addedFineChannelUuids;
}

/**
 * Resets the dialog's form and working channel.
 */
async function resetChannelForm() {
  emit('reset-channel');

  await nextTick();
  editorForm.reset();
}

/**
 * Shows or hides the capability wizard.
 * @param isShown - Whether the wizard should be visible.
 */
function setWizardVisibility(isShown: boolean) {
  properties.channel.wizard.show = isShown;

  if (!isShown) {
    onDmxValueResolutionChanged();
  }
}

/**
 * Inserts the wizard's capabilities and hides the wizard.
 * @param insertIndex - The position where the capabilities are inserted.
 */
async function onWizardClose(insertIndex: number) {
  setWizardVisibility(false);

  await nextTick();
  const firstNewCapability = capabilities.value?.[insertIndex];
  const firstNewCapabilityElement = (firstNewCapability as any)?.getElement?.();
  if (!firstNewCapability || !firstNewCapabilityElement) {
    return;
  }
  const scrollContainer = firstNewCapabilityElement.closest('.dialog');

  scrollIntoView(firstNewCapabilityElement, {
    time: 0,
    align: {
      top: 0,
      left: 0,
      topOffset: 100,
    },
    isScrollable: (target) => target === scrollContainer,
  }, () => firstNewCapability.focus());
}

/**
 * Opens the dialog's collapsible details section.
 */
function openDetails() {
  for (const details of document.querySelectorAll('details')) {
    details.open = true;
  }
}

/**
 * Closes the dialog's collapsible details section.
 */
function closeDetails() {
  for (const details of document.querySelectorAll('details')) {
    details.open = false;
  }
}

/**
 * Inserts an empty capability at the given index.
 * @param index - The insertion index.
 */
function insertEmptyCapability(index: number) {
  properties.channel.capabilities.splice(index, 0, getEmptyCapability());
}
</script>
