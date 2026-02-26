<template>
  <section :data-mode-uuid="mode.uuid" class="fixture-mode card">

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

    <Validate
      :state="formstate"
      :custom="{ 'no-empty-channel-list': channelListNotEmpty }"
      tag="div"
      class="mode-channels">
      <input v-model="mode.channels" :name="`mode-${index}-channels`" type="hidden">
      <Draggable :list="mode.channels" v-bind="dragOptions">
        <TransitionGroup class="mode-channels" tag="ol">
          <li
            v-for="(channelUuid, channelIndex) in mode.channels"
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
        </TransitionGroup>
      </Draggable>
      <FieldMessages
        :state="formstate"
        :name="`mode-${index}-channels`"
        show="$submitted"
        tag="div"
        class="error-message">
        <template #no-empty-channel-list>
          <div>A mode must contain at least one channel.</div>
        </template>
      </FieldMessages>
    </Validate>

    <a href="#add-channel" class="button primary" @click.prevent="addChannel()">add channel</a>

  </section>
</template>

<style lang="scss" scoped>
.fixture-mode :deep(section) {
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

import { modeProperties, schemaDefinitions } from '~~/lib/schema-properties.js';
import { constants } from '@/assets/scripts/editor-utilities.js';

interface Props {
  mode: {
    uuid: string;
    name: string;
    shortName?: string;
    rdmPersonalityIndex?: number;
    enablePhysicalOverride: boolean;
    physical?: Record<string, unknown>;
    channels: string[];
  };
  index: number;
  fixture: {
    modes: Array<{ uuid: string; channels: string[] }>;
    availableChannels: Record<string, { coarseChannelId?: string; resolution?: number }>;
    rdmModelId: number | null;
  };
  formstate: Record<string, unknown>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  remove: [];
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
      if (from === to) {
        return false;
      }

      if (!dragElement) return false;

      const channelUuid = dragElement.getAttribute('data-channel-uuid');
      const modeUuid = to.el.closest('.fixture-mode')?.getAttribute('data-mode-uuid');
      if (!channelUuid || !modeUuid) return false;

      const targetMode = props.fixture.modes.find(mode => mode.uuid === modeUuid);
      if (!targetMode) return false;

      if (targetMode.channels.includes(channelUuid)) {
        return false;
      }

      const channel = props.fixture.availableChannels[channelUuid];
      if (!('coarseChannelId' in channel)) {
        return true;
      }

      if (!targetMode.channels.includes(channel.coarseChannelId)) {
        return false;
      }

      if (channel.resolution === constants.RESOLUTION_16BIT) {
        return true;
      }

      return targetMode.channels.some(uuid => {
        const otherChannel = props.fixture.availableChannels[uuid];
        return otherChannel?.coarseChannelId === channel.coarseChannelId && otherChannel?.resolution === channel.resolution! - 1;
      });
    },
    revertClone: true,
  },
};

const channelListNotEmpty = computed(() => props.mode.channels.length > 0);

function getFixtureEditor() {
  const parent = getCurrentInstance()?.parent;
  if (!parent) return null;
  const vueForm = parent.exposed || parent.proxy;
  if (!vueForm) return null;
  const grandParent = parent.parent;
  if (!grandParent) return null;
  return grandParent.exposed || grandParent.proxy;
}

function getChannelName(channelUuid: string) {
  const editor = getFixtureEditor();
  if (!editor || !editor.getChannelName) return channelUuid;
  return editor.getChannelName(channelUuid);
}

function editChannel(channelUuid: string) {
  emit('open-channel-editor', {
    modeId: props.mode.uuid,
    editMode: 'edit-?',
    uuid: channelUuid,
  });
}

function addChannel() {
  emit('open-channel-editor', {
    modeId: props.mode.uuid,
    editMode: 'add-existing',
  });
}

function isChannelNameUnique(channelUuid: string) {
  const editor = getFixtureEditor();
  if (!editor || !editor.isChannelNameUnique) return true;
  return editor.isChannelNameUnique(channelUuid);
}

function isFineChannel(channelUuid: string) {
  return 'coarseChannelId' in props.fixture.availableChannels[channelUuid];
}

function moveChannel(channelUuid: string, delta: number) {
  const channelIndex = props.mode.channels.indexOf(channelUuid);
  const newIndex = channelIndex + delta;
  if (newIndex < 0 || newIndex >= props.mode.channels.length) {
    return;
  }

  props.mode.channels.splice(channelIndex, 1);
  props.mode.channels.splice(newIndex, 0, channelUuid);
}

function removeChannel(channelUuid: string) {
  const channel = props.fixture.availableChannels[channelUuid];

  let coarseChannelId = channelUuid;
  let resolution = constants.RESOLUTION_8BIT;
  if (isFineChannel(channelUuid)) {
    coarseChannelId = channel.coarseChannelId!;
    resolution = channel.resolution!;
  }

  for (const otherChannel of Object.values(props.fixture.availableChannels)) {
    if (otherChannel?.coarseChannelId === coarseChannelId && otherChannel?.resolution! > resolution) {
      const editor = getFixtureEditor();
      if (editor?.removeChannel) {
        editor.removeChannel(otherChannel.uuid, props.mode.uuid);
      }
    }
  }

  const editor = getFixtureEditor();
  if (editor?.removeChannel) {
    editor.removeChannel(channelUuid, props.mode.uuid);
  }
}

onMounted(() => {
  const root = getCurrentInstance()?.appContext.app._context.provides;
  // @ts-ignore - private property
  if (window.__oflRestoreComplete) {
    firstInput.value?.$el?.focus();
  }
});
</script>
