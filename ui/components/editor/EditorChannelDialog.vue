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
import { v4 as uuidv4 } from 'uuid';

import { capabilityTypes, channelProperties } from '~~/lib/schema-properties.js';
import {
  constants,
  getEmptyCapability,
  getEmptyFineChannel,
  getEmptyFormState,
  getSanitizedChannel,
  isCapabilityChanged,
  isChannelChanged,
} from '@/assets/scripts/editor-utilities.js';

import A11yDialog from '../A11yDialog.vue';
import LabeledInput from '../LabeledInput.vue';
import PropertyInputBoolean from '../PropertyInputBoolean.vue';
import PropertyInputEntity from '../PropertyInputEntity.vue';
import PropertyInputSelect from '../PropertyInputSelect.vue';
import PropertyInputText from '../PropertyInputText.vue';
import EditorCapability from './EditorCapability.vue';
import EditorCapabilityWizard from './EditorCapabilityWizard.vue';

interface Props {
  channel: object;
  fixture: object;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'channel-changed': [];
  'remove-channel': [channelId: string];
  'reset-channel': [];
}>();

const channelDialog = ref<typeof A11yDialog | null>(null);
const capabilities = ref<typeof EditorCapability[] | null>(null);
const formstate = ref(getEmptyFormState());
const restored = ref(false);
const channelChanged = ref(false);
const selectedChannelUuids = ref<string[]>([]);

const dmxMax = computed(() => Math.pow(256, props.channel.dmxValueResolution) - 1);

const currentMode = computed(() => {
  const uuid = props.channel.modeId;
  const modeIndex = props.fixture.modes.findIndex(mode => mode.uuid === uuid);
  return props.fixture.modes[modeIndex];
});

const currentModeUnchosenChannelUuids = computed(() => {
  return Object.keys(props.fixture.availableChannels).filter(
    channelUuid => !currentMode.value.channels.includes(channelUuid),
  );
});

const currentModeUnchosenChannels = computed(() => {
  return currentModeUnchosenChannelUuids.value.map(channelUuid => ({
    inputId: `unchosen-channel-${channelUuid}`,
    uuid: channelUuid,
    name: getChannelName(channelUuid),
    showUuid: !isChannelNameUnique(channelUuid),
    isSelected: isChannelSelected(channelUuid),
  }));
});

const selectedChannelUuidsString = computed(() => selectedChannelUuids.value.join(`,`));

const currentModeDisplayName = computed(() => {
  let modeName = `#${props.fixture.modes.indexOf(currentMode.value) + 1}`;
  if (currentMode.value.shortName) {
    modeName = `"${currentMode.value.shortName}"`;
  }
  else if (currentMode.value.name) {
    modeName = `"${currentMode.value.name}"`;
  }
  return modeName;
});

const title = computed(() => {
  if (props.channel.editMode === `add-existing`) {
    return `Add channel to mode ${currentModeDisplayName.value}`;
  }

  if (props.channel.editMode === `create`) {
    return `Create new channel`;
  }

  if (props.channel.editMode === `edit-duplicate`) {
    return `Edit channel duplicate`;
  }

  return `Edit channel`;
});

const areCapabilitiesChanged = computed(() => {
  return props.channel.capabilities.some(
    capability => isCapabilityChanged(capability),
  );
});

const submitButtonTitle = computed(() => {
  if (props.channel.editMode === `add-existing`) {
    const count = selectedChannelUuids.value.length;
    return count <= 1 ? `Add channel` : `Add ${count} channels`;
  }

  if (props.channel.editMode === `create`) {
    return `Create channel`;
  }

  return `Save changes`;
});

watch(() => props.channel, () => {
  if (isChannelChanged(props.channel)) {
    emit(`channel-changed`);
    channelChanged.value = true;
  }
}, { deep: true });

function getFixtureEditor() {
  return null;
}

function setEditModeCreate() {
  props.channel.editMode = `create`;
  props.channel.uuid = uuidv4();
}

function getChannelName(channelUuid: string) {
  const fixtureEditor = getFixtureEditor();
  return fixtureEditor?.getChannelName(channelUuid) ?? '';
}

function isChannelNameUnique(channelUuid: string) {
  const fixtureEditor = getFixtureEditor();
  return fixtureEditor?.isChannelNameUnique(channelUuid) ?? true;
}

function isChannelSelected(channelUuid: string) {
  return selectedChannelUuids.value.includes(channelUuid);
}

function modeHasChannel(channelUuid: string) {
  return currentMode.value.channels.includes(channelUuid);
}

function toggleChannelSelection(channelUuid: string) {
  if (isChannelSelected(channelUuid)) {
    deselectChannel(channelUuid);
  }
  else {
    selectChannel(channelUuid);
  }

  channelChanged.value = true;
}

function deselectChannel(channelUuid: string) {
  const deselectedChannel = props.fixture.availableChannels[channelUuid];
  const isFineChannel = `coarseChannelId` in deselectedChannel;

  selectedChannelUuids.value = selectedChannelUuids.value.filter(uuid => uuid !== channelUuid);

  if (isFineChannel) {
    selectedChannelUuids.value = selectedChannelUuids.value.filter(uuid => {
      const channel = props.fixture.availableChannels[uuid];
      return (
        !(`coarseChannelId` in channel) ||
        channel.coarseChannelId !== deselectedChannel.coarseChannelId ||
        channel.resolution < deselectedChannel.resolution
      );
    });
    return;
  }

  selectedChannelUuids.value = selectedChannelUuids.value.filter(uuid => {
    const channel = props.fixture.availableChannels[uuid];
    return !(`coarseChannelId` in channel) || channel.coarseChannelId !== channelUuid;
  });
}

function selectChannel(channelUuid: string) {
  if (isChannelSelected(channelUuid)) {
    return;
  }

  const selectedChannel = props.fixture.availableChannels[channelUuid];
  const isFineChannel = `coarseChannelId` in selectedChannel;

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
    const channel = props.fixture.availableChannels[uuid];
    if (
      `coarseChannelId` in channel &&
      channel.coarseChannelId === coarseChannelId &&
      channel.resolution < currentResolution &&
      !isChannelSelected(uuid) &&
      !modeHasChannel(uuid)
    ) {
      selectedChannelUuids.value.push(uuid);
    }
  }

  selectedChannelUuids.value.push(channelUuid);
}

async function onChannelDoubleClick(channelUuid: string) {
  if (!isChannelSelected(channelUuid)) {
    toggleChannelSelection(channelUuid);
  }

  if (selectedChannelUuids.value.some(uuid => uuid !== channelUuid)) {
    return;
  }

  await nextTick();
  onSubmit();
}

async function onChannelDialogOpen() {
  if (restored.value) {
    restored.value = false;
    return;
  }

  if (props.channel.editMode === `add-existing` && currentModeUnchosenChannels.value.length === 0) {
    props.channel.editMode = `create`;
  }
  else if (props.channel.editMode === `add-existing`) {
    props.channel.uuid = ``;
    selectedChannelUuids.value = [];
  }
  else if (props.channel.editMode === `edit-all` || props.channel.editMode === `edit-duplicate`) {
    copyPropertiesFromChannel(props.fixture.availableChannels[props.channel.uuid]);
  }

  await nextTick();
  channelChanged.value = false;
}

function copyPropertiesFromChannel(channel: object) {
  for (const property of Object.keys(channel)) {
    (props.channel as any)[property] = structuredClone((channel as any)[property]);
  }
}

async function onChannelDialogClose() {
  if (props.channel.editMode === ``) {
    return;
  }

  if (channelChanged.value && !window.confirm(`Do you want to lose the entered channel data?`)) {
    await nextTick();
    restored.value = true;
    channelDialog.value?.show();
    return;
  }

  resetChannelForm();
}

function onChannelNameChanged(channelName: string) {
  if (areCapabilitiesChanged.value || channelName === ``) {
    return;
  }

  const capability = props.channel.capabilities[0];

  const matchingColor = capabilityTypes.ColorIntensity.properties.color.enum.find(
    color => channelName.toLowerCase().includes(color.toLowerCase()),
  );
  if (matchingColor) {
    capability.type = `ColorIntensity`;
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
    type => capabilityTypeSuggestions[type].test(channelName),
  );

  if (matchingType) {
    capability.type = matchingType;
  }
}

function onResolutionChanged() {
  if (props.channel.dmxValueResolution > props.channel.resolution) {
    props.channel.dmxValueResolution = props.channel.resolution;
  }
}

async function onDmxValueResolutionChanged() {
  await nextTick();

  let index = props.channel.capabilities.length - 1;
  while (index >= 0) {
    const capability = props.channel.capabilities[index];
    if (capability.dmxRange !== null && capability.dmxRange[1] !== null && !props.channel.wizard.show) {
      capabilities.value?.[index]?.onEndUpdated();
      break;
    }
    index--;
  }
}

function onSubmit() {
  if (props.channel.wizard.show) {
    return;
  }

  if (formstate.value.$invalid) {
    const invalidFields = document.querySelectorAll(`#channel-dialog .vf-field-invalid`);

    for (let index = 0; index < invalidFields.length; index++) {
      const enclosingDetails = invalidFields[index].closest(`details:not([open])`);

      if (enclosingDetails) {
        enclosingDetails.open = true;
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

  for (const capability of capabilities.value ?? []) {
    capability.cleanCapabilityData();
  }

  const actions: Record<string, () => void> = {
    'create': saveCreatedChannel,
    'edit-all': saveEditedChannel,
    'edit-duplicate': saveDuplicatedChannel,
    'add-existing': addExistingChannel,
  };

  if (props.channel.editMode in actions) {
    actions[props.channel.editMode]();
  }

  resetChannelForm();
}

function saveCreatedChannel() {
  (props.fixture.availableChannels as any)[props.channel.uuid] = getSanitizedChannel(props.channel);
  currentMode.value.channels.push(props.channel.uuid);

  addFineChannels(props.channel, constants.RESOLUTION_16BIT, true);
}

function saveEditedChannel() {
  const previousResolution = props.fixture.availableChannels[props.channel.uuid].resolution;
  props.fixture.availableChannels[props.channel.uuid] = getSanitizedChannel(props.channel);

  if (previousResolution > props.channel.resolution) {
    for (const channelId of Object.keys(props.fixture.availableChannels)) {
      const channel = props.fixture.availableChannels[channelId];
      if (channel.coarseChannelId === props.channel.uuid && channel.resolution > props.channel.resolution) {
        emit(`remove-channel`, channelId);
      }
    }
  }
  else {
    addFineChannels(props.channel, previousResolution + 1, false);
  }
}

function saveDuplicatedChannel() {
  const oldChannelKey = props.channel.uuid;

  const newChannelKey = uuidv4();
  const newChannel = getSanitizedChannel(props.channel);
  newChannel.uuid = newChannelKey;
  (props.fixture.availableChannels as any)[newChannelKey] = newChannel;

  const fineChannelUuids = addFineChannels(newChannel, constants.RESOLUTION_16BIT, false);

  currentMode.value.channels = currentMode.value.channels.map(key => {
    if (key === oldChannelKey) {
      return newChannelKey;
    }

    const oldFineChannel = props.fixture.availableChannels[key];
    if (oldFineChannel.coarseChannelId === oldChannelKey) {
      return fineChannelUuids[oldFineChannel.resolution];
    }

    return key;
  });
}

function addExistingChannel() {
  for (const channelUuid of selectedChannelUuids.value) {
    if (!modeHasChannel(channelUuid)) {
      currentMode.value.channels.push(channelUuid);
    }
  }

  selectedChannelUuids.value = [];
}

function addFineChannels(coarseChannel: object, offset: number, addToMode: boolean) {
  const addedFineChannelUuids: string[] = [];

  for (let index = offset; index <= (coarseChannel as any).resolution; index++) {
    const fineChannel = getEmptyFineChannel((coarseChannel as any).uuid, index);
    (props.fixture.availableChannels as any)[fineChannel.uuid] = getSanitizedChannel(fineChannel);
    addedFineChannelUuids[index] = fineChannel.uuid;

    if (addToMode) {
      currentMode.value.channels.push(fineChannel.uuid);
    }
  }

  return addedFineChannelUuids;
}

async function resetChannelForm() {
  emit(`reset-channel`);

  await nextTick();
  formstate.value._reset();
}

function setWizardVisibility(show: boolean) {
  props.channel.wizard.show = show;

  if (!show) {
    onDmxValueResolutionChanged();
  }
}

async function onWizardClose(insertIndex: number) {
  setWizardVisibility(false);

  await nextTick();
  const firstNewCapability = capabilities.value?.[insertIndex];
  if (!firstNewCapability) return;
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
}

function openDetails() {
  for (const details of document.querySelectorAll(`details`)) {
    details.open = true;
  }
}

function closeDetails() {
  for (const details of document.querySelectorAll(`details`)) {
    details.open = false;
  }
}

function insertEmptyCapability(index: number) {
  props.channel.capabilities.splice(index, 0, getEmptyCapability());
}
</script>
