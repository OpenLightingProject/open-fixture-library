<template>
  <section :data-mode-uuid="mode.uuid" class="editor-mode card">

    <a
      v-if="fixture.modes.length > 1"
      href="#remove-mode"
      class="icon-button close"
      @click.prevent="$emit('remove')">
      Remove mode
      <OflSvg name="close" />
    </a>

    <h2>Mode #{{ index + 1 }}</h2>

    <LabeledInput :formstate="formstate" :name="`mode-${index}-name`" label="Name">
      <PropertyInputText
        ref="firstInput"
        v-model="mode.name"
        :name="`mode-${index}-name`"
        :schema-property="schemaDefinitions.modeNameString.allOf[1]"
        required
        no-mode-name
        hint="e.g. Extended"
        title="The name must not contain the word 'mode'." />
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`mode-${index}-shortName`" label="Unique short name">
      <PropertyInputText
        v-model="mode.shortName"
        :name="`mode-${index}-shortName`"
        :schema-property="schemaDefinitions.modeNameString.allOf[1]"
        no-mode-name
        hint="e.g. ext; defaults to name"
        title="The short name must not contain the word 'mode'." />
    </LabeledInput>

    <LabeledInput
      v-if="fixture.rdmModelId !== null"
      :formstate="formstate"
      :name="`mode-${index}-rdmPersonalityIndex`"
      label="RDM personality index">
      <PropertyInputNumber
        v-model="mode.rdmPersonalityIndex"
        :name="`mode-${index}-rdmPersonalityIndex`"
        :schema-property="modeProperties.rdmPersonalityIndex" />
    </LabeledInput>

    <h3>Physical override</h3>

    <label>
      <input
        v-model="mode.enablePhysicalOverride"
        type="checkbox"
        class="enable-physical-override">
      Override fixture's physical data in this mode
    </label>

    <section class="physical-override">
      <EditorPhysical
        v-if="mode.enablePhysicalOverride"
        v-model="mode.physical"
        :formstate="formstate"
        :name-prefix="`mode-${index}`" />
    </section>

    <h3>DMX channels</h3>

    <div class="mode-channels">
      <input
        ref="channelInput"
        v-model="mode.channels"
        :name="`mode-${index}-channels`"
        type="hidden">
      <Draggable
        :list="mode.channels"
        v-bind="dragOptions"
        tag="ol"
        class="mode-channels"
        :item-key="(channelUuid: string) => channelUuid">
        <template #item="{ element: channelUuid, index: channelIndex }">
          <li
            :key="channelUuid"
            :value="channelIndex + 1"
            :data-channel-uuid="channelUuid">

            <span class="channel-name">{{ getChannelName(channelUuid) }}</span>

            <code v-if="!isChannelNameUnique(channelUuid)" class="channel-uuid"> {{ channelUuid }}</code>

            <span class="channel-buttons">
              <button
                type="button"
                title="Drag or press ↓↑ to change channel order"
                class="drag-handle icon-button"
                @keyup.up.prevent="moveChannel(channelUuid, -1)"
                @keyup.down.prevent="moveChannel(channelUuid, 1)"
                @click.prevent>
                <OflSvg name="move" />
              </button>

              <button
                v-if="!isFineChannel(channelUuid)"
                type="button"
                class="icon-button"
                title="Edit channel"
                @click.prevent="editChannel(channelUuid)">
                <OflSvg name="pencil" />
              </button>

              <button
                type="button"
                class="icon-button"
                title="Remove channel"
                @click.prevent="removeChannel(channelUuid)">
                <OflSvg name="close" />
              </button>
            </span>

          </li>
        </template>
      </Draggable>
      <div v-show="channelListErrorVisible" class="error-message">
        <div>A mode must contain at least one channel.</div>
      </div>
    </div>

    <a href="#add-channel" class="button primary" @click.prevent="addChannel()">add channel</a>

  </section>
</template>

<style lang="scss" scoped>
.editor-mode :deep(section) {
  flex-direction: column;

  & > .label {
    flex-basis: auto;
  }
}

.mode-channels {
  padding-top: 4px;
  padding-bottom: 4px;
  margin: 0 0 1ex;

  & li {
    position: relative;
  }

  & button:focus {
    opacity: 1;
  }

  & .channel-buttons {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    background-color: theme-color(card-background, 0%);
    transition: background-color 0.1s, box-shadow 0.1s;

    & button {
      opacity: 0;
      transition: opacity 0.1s;
    }
  }

  // has to be a separate rule because older browsers would ignore the whole rule
  & .channel-buttons:focus-within {
    background-color: theme-color(card-background);
    box-shadow: -1ex 0 1ex 0.5ex theme-color(card-background);

    & button {
      opacity: 1;
    }
  }

  & li:hover .channel-buttons,
  & li.sortable-chosen .channel-buttons,
  & li.sortable-ghost .channel-buttons {
    background-color: theme-color(card-background);
    box-shadow: -1ex 0 1ex 0.5ex theme-color(card-background);

    & button {
      opacity: 1;
    }
  }

  & .drag-handle {
    cursor: grab;
  }
}
</style>

<script setup lang="ts">
import Draggable from 'vuedraggable';
import { constants } from '@/assets/scripts/editor-utilities.js';
import { useEditorFormContext } from '~/composables/useEditorForm';
import type { EditorPhysical } from '~/types/editor';
import { modeProperties, schemaDefinitions } from '~~/lib/schema-properties.js';
import PropertyInputText from '../PropertyInputText.vue';

interface Properties {
  mode: {
    uuid: string;
    name: string;
    shortName?: string;
    rdmPersonalityIndex?: number;
    enablePhysicalOverride: boolean;
    physical?: EditorPhysical;
    channels: string[];
  };
  index: number;
  fixture: {
    modes: Array<{ uuid: string; channels: string[] }>;
    availableChannels: Record<string, {
      name?: string;
      uuid?: string;
      coarseChannelId?: string;
      resolution?: number;
    }>;
    rdmModelId: number | null;
  };
  formstate: Record<string, unknown>;
}

const properties = defineProps<Properties>();

const emit = defineEmits<{
  'remove': [];
  'open-channel-editor': [payload: { modeId: string; editMode: string; uuid?: string }];
}>();

const firstInput = ref<InstanceType<typeof PropertyInputText> | null>(null);

const dragOptions = {
  animation: 200,
  handle: '.drag-handle',
  emptyInsertThreshold: 20,
  group: {
    name: 'mode',
    pull: 'clone',
    put: (to: { el: HTMLElement }, from: unknown, dragElement: HTMLElement | null) => {
      if ((from === to) || !dragElement) {
        return false;
      }

      const channelUuid = dragElement.getAttribute('data-channel-uuid');
      const modeUuid = to.el.closest('.editor-mode')?.getAttribute('data-mode-uuid');
      if (!channelUuid || !modeUuid) {
        return false;
      }

      const targetMode = properties.fixture.modes.find((mode) => mode.uuid === modeUuid);
      if (!targetMode || targetMode.channels.includes(channelUuid)) {
        return false;
      }

      const channel = properties.fixture.availableChannels[channelUuid];
      if (!('coarseChannelId' in channel)) {
        return true;
      }

      if (!targetMode.channels.includes(channel.coarseChannelId)) {
        return false;
      }

      if (channel.resolution === constants.RESOLUTION_16BIT) {
        return true;
      }

      return targetMode.channels.some((uuid) => {
        const otherChannel = properties.fixture.availableChannels[uuid];
        return otherChannel?.coarseChannelId === channel.coarseChannelId && otherChannel?.resolution === channel.resolution! - 1;
      });
    },
    revertClone: true,
  },
};

const channelListNotEmpty = computed(() => properties.mode.channels.length > 0);
const channelInput = ref<HTMLInputElement | null>(null);
const editorForm = useEditorFormContext();
const channelFieldName = computed(() => `mode-${properties.index}-channels`);

const channelListErrorVisible = computed(() => {
  return Boolean(editorForm?.submitted.value && editorForm.errors.value[channelFieldName.value]);
});

let unregisterChannelField: (() => void) | null = null;

/**
 * Registers the mode's channel list with the editor form.
 */
function registerChannelField() {
  unregisterChannelField?.();
  unregisterChannelField = null;

  if (!editorForm) {
    return;
  }

  unregisterChannelField = editorForm.registerField({
    name: channelFieldName.value,
    getValue: () => properties.mode.channels,
    getRules: () => [{
      name: 'no-empty-channel-list',
      run: () => channelListNotEmpty.value,
      allowEmpty: true,
    }],
    getAttrs: () => ({}),
    getElement: () => channelInput.value,
  });
}

onMounted(registerChannelField);
onBeforeUnmount(() => unregisterChannelField?.());
watch(channelFieldName, registerChannelField);
watch(() => properties.mode.channels.length, () => {
  void editorForm?.validateField(channelFieldName.value);
});

/**
 * Resolves a channel's display name, including fine channel suffixes.
 * @param channelUuid - The channel UUID.
 * @returns The display name.
 */
function getChannelName(channelUuid: string): string {
  const channel = properties.fixture.availableChannels[channelUuid];
  if (!channel) {
    return channelUuid;
  }

  if ('coarseChannelId' in channel) {
    let name = `${getChannelName(channel.coarseChannelId)} fine`;
    if (channel.resolution! > constants.RESOLUTION_16BIT) {
      name += `^${channel.resolution! - 1}`;
    }

    return name;
  }

  return channel.name ?? channelUuid;
}

/**
 * Opens the channel editor for an existing channel.
 * @param channelUuid - The channel UUID.
 */
function editChannel(channelUuid: string) {
  emit('open-channel-editor', {
    modeId: properties.mode.uuid,
    editMode: 'edit-?',
    uuid: channelUuid,
  });
}

/**
 * Opens the dialog for adding an existing channel.
 */
function addChannel() {
  emit('open-channel-editor', {
    modeId: properties.mode.uuid,
    editMode: 'add-existing',
  });
}

/**
 * Checks whether a channel's name is unique within the fixture.
 * @param channelUuid - The channel UUID.
 * @returns Whether the name is unique.
 */
function isChannelNameUnique(channelUuid: string): boolean {
  const channelName = getChannelName(channelUuid);

  return Object.keys(properties.fixture.availableChannels).every(
    (uuid) => channelName !== getChannelName(uuid) || uuid === channelUuid,
  );
}

/**
 * Checks whether a channel is a fine channel.
 * @param channelUuid - The channel UUID.
 * @returns Whether the channel is fine.
 */
function isFineChannel(channelUuid: string) {
  return 'coarseChannelId' in properties.fixture.availableChannels[channelUuid];
}

/**
 * Moves a channel within the mode.
 * @param channelUuid - The channel UUID.
 * @param delta - The number of positions to move.
 */
function moveChannel(channelUuid: string, delta: number) {
  const channelIndex = properties.mode.channels.indexOf(channelUuid);
  const newIndex = channelIndex + delta;
  if (newIndex < 0 || newIndex >= properties.mode.channels.length) {
    return;
  }

  properties.mode.channels.splice(channelIndex, 1);
  properties.mode.channels.splice(newIndex, 0, channelUuid);
}

/**
 * Removes a channel reference from the mode.
 * @param channelUuid - The channel UUID.
 */
function removeFromMode(channelUuid: string) {
  const channelPosition = properties.mode.channels.indexOf(channelUuid);
  if (channelPosition !== -1) {
    properties.mode.channels.splice(channelPosition, 1);
  }
}

/**
 * Removes a channel and its finer channels from the mode.
 * @param channelUuid - The channel UUID.
 */
function removeChannel(channelUuid: string) {
  const channel = properties.fixture.availableChannels[channelUuid];

  let coarseChannelId = channelUuid;
  let resolution = constants.RESOLUTION_8BIT;
  if (isFineChannel(channelUuid)) {
    coarseChannelId = channel.coarseChannelId!;
    resolution = channel.resolution!;
  }

  // remove finer channels of the same coarse channel first
  for (const otherChannel of Object.values(properties.fixture.availableChannels)) {
    if (otherChannel?.coarseChannelId === coarseChannelId && otherChannel.resolution! > resolution) {
      removeFromMode(otherChannel.uuid!);
    }
  }

  removeFromMode(channelUuid);
}

onMounted(() => {
  if (window.__oflRestoreComplete) {
    firstInput.value?.$el?.focus();
  }
});
</script>
