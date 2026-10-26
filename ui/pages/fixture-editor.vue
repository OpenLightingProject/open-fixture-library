<template>
  <div id="fixture-editor">
    <h1>Fixture Editor</h1>

    <section class="card">
      <h2>Import fixture</h2>
      Instead of creating a new fixture definition in the editor below, you can also <NuxtLink to="/import-fixture-file">import an existing fixture definition file</NuxtLink>.
    </section>

    <noscript class="card yellow">
      Please enable JavaScript to use the Fixture Editor!
    </noscript>

    <ClientOnly placeholder="Fixture editor is loading...">

      <form
        action="#"
        class="only-js"
        novalidate
        @submit.prevent="onSubmit()">

        <EditorManufacturer
          :fixture="fixture"
          :formstate="formstate"
          :manufacturers="manufacturers" />

        <EditorFixtureInformation
          :fixture="fixture"
          :formstate="formstate"
          :manufacturers="manufacturers" />

        <section class="physical card">
          <h2>Physical data</h2>
          <EditorPhysical
            v-model="fixture.physical"
            :formstate="formstate"
            name-prefix="fixture" />
        </section>

        <MasonryCardContainer>
          <EditorMode
            v-for="(mode, index) of fixture.modes"
            :key="mode.uuid"
            :mode="fixture.modes[index]"
            :index="Number(index)"
            :fixture="fixture"
            :formstate="formstate"
            @open-channel-editor="openChannelEditor($event)"
            @remove="fixture.modes.splice(index, 1)" />

          <a class="card add-mode-link" href="#add-mode" @click.prevent="addNewMode()">
            <h2>+ Add mode</h2>
          </a>
        </MasonryCardContainer>

        <section class="user card">
          <h2>Author data</h2>

          <LabeledInput :formstate="formstate" name="author" label="Your name">
            <PropertyInputText
              v-model="fixture.metaAuthor"
              :schema-property="schemaDefinitions.nonEmptyString"
              required
              name="author"
              hint="e.g. Anonymous" />
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="github-username"
            label="GitHub username"
            hint="If you want to be mentioned in the pull request.">
            <PropertyInputText
              v-model="githubUsername"
              :schema-property="schemaDefinitions.nonEmptyString"
              name="github-username" />
          </LabeledInput>

          <LabeledInput hidden name="honeypot" label="Ignore this!">
            <input v-model="honeypot" type="text">
            <div class="hint">Spammers are likely to fill this field. Leave it empty to show that you're a human.</div>
          </LabeledInput>
        </section>

        <div class="button-bar right">
          <button type="submit" class="save-fixture primary">Create fixture</button>
        </div>

      </form>

      <EditorChannelDialog
        :channel="channel"
        :fixture="fixture"
        @reset-channel="resetChannel()"
        @channel-changed="autoSave()"
        @remove-channel="removeChannel($event)" />

      <EditorChooseChannelEditModeDialog
        :channel="channel"
        :fixture="fixture" />

      <EditorRestoreDialog
        v-model="restoredData"
        @restore="applyRestoredData($event)"
        @restore-complete="restoreComplete()" />

      <EditorSubmitDialog
        ref="submitDialog"
        endpoint="/api/v1/fixtures/from-editor"
        :github-username="githubUsername"
        @success="onFixtureSubmitted()"
        @reset="reset()" />

    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.add-mode-link {
  text-align: center;
}

noscript.card {
  display: block;
  margin-top: 1rem;
}
</style>

<script setup lang="ts">
import {
  getEmptyChannel,
  getEmptyFixture,
  getEmptyFormState,
  getEmptyMode,
  scrollToFirstInvalidField,
} from '@/assets/scripts/editor-utilities.js';
import { useEditorForm } from '~/composables/useEditorForm';
import type { EditorChannel, EditorFixture } from '~/types/editor';
import {
  getStoredItem,
  removeStoredItem,
  setStoredItem,
} from '~/utils/storage';
import { schemaDefinitions } from '~~/lib/schema-properties.js';

const route = useRoute();
const router = useRouter();

const editorForm = useEditorForm();

const { data: manufacturers } = await useFetch('/api/v1/manufacturers');

if (manufacturers.value) {
  delete manufacturers.value.generic;
}

const formstate = ref(getEmptyFormState());
const readyToAutoSave = ref(false);
const restoredData = ref<{ timestamp: number; fixture: any; channel?: any } | undefined>(undefined);
const fixture = ref<EditorFixture>(getEmptyFixture() as EditorFixture);
const channel = ref<EditorChannel>(getEmptyChannel() as EditorChannel);
const githubUsername = ref('');
const honeypot = ref('');
const submitDialog = ref<{ validate: (data: unknown[]) => void } | null>(null);

/**
 * Appends an empty mode to the fixture.
 */
function addNewMode() {
  fixture.value.modes.push(getEmptyMode());
}

/**
 * Opens the channel editor with the given channel data.
 * @param channelData - The channel data to edit.
 */
function openChannelEditor(channelData: Record<string, unknown>) {
  channel.value = { ...channel.value, ...channelData };
}

/**
 * Resets the channel editor to an empty channel.
 */
function resetChannel() {
  channel.value = getEmptyChannel();
}

/**
 * Removes a channel from a mode, or from the whole fixture when no mode is given.
 * @param channelUuid - The channel UUID.
 * @param modeUuid - The mode to remove the channel from.
 */
function removeChannel(channelUuid: string, modeUuid?: string) {
  if (modeUuid) {
    const channelMode = fixture.value.modes.find((mode) => mode.uuid === modeUuid);

    if (channelMode) {
      const channelPosition = channelMode.channels.indexOf(channelUuid);
      if (channelPosition !== -1) {
        channelMode.channels.splice(channelPosition, 1);
      }
    }

    return;
  }

  // remove fine channels first
  for (const availableChannel of Object.values(fixture.value.availableChannels)) {
    if ('coarseChannelId' in availableChannel && availableChannel.coarseChannelId === channelUuid) {
      removeChannel(availableChannel.uuid);
    }
  }

  // now remove all references from modes
  for (const mode of fixture.value.modes) {
    removeChannel(channelUuid, mode.uuid);
  }

  // finally remove the channel itself
  delete fixture.value.availableChannels[channelUuid];
}

/**
 * Stores the current editor state in local storage.
 */
function autoSave() {
  if (!readyToAutoSave.value) {
    return;
  }

  setStoredItem('autoSave', JSON.stringify([
    {
      fixture: fixture.value,
      channel: channel.value,
      timestamp: Date.now(),
    },
  ]));
}

/**
 * Removes the stored auto-save state.
 */
function clearAutoSave() {
  removeStoredItem('autoSave');
}

/**
 * Restores the stored auto-save state, if any.
 */
function restoreAutoSave() {
  try {
    const saved = JSON.parse(getStoredItem('autoSave') || 'null');
    if (saved) {
      restoredData.value = saved.pop();
    }

    if (restoredData.value === undefined) {
      throw new Error('restoredData is undefined');
    }
  }
  catch {
    restoredData.value = undefined;
    restoreComplete();
  }
}

/**
 * Applies restored fixture and channel data to the editor.
 * @param restored - The restored editor state.
 * @param restored.fixture - The restored fixture data.
 * @param restored.channel - The restored channel data.
 */
function applyRestoredData(restored: { fixture: unknown; channel: unknown }) {
  fixture.value = restored.fixture as typeof fixture.value;
  channel.value = restored.channel as typeof channel.value;
}

/**
 * Re-enables auto-saving after a restore attempt.
 */
function restoreComplete() {
  readyToAutoSave.value = true;
  window.scrollTo(0, 0);
}

/**
 * Applies fixture fields from the `prefill` query parameter.
 */
function applyQueryPrefillData() {
  if (!route.query.prefill) {
    return;
  }

  try {
    const prefillObject = JSON.parse(route.query.prefill as string);
    for (const [key, value] of Object.entries(prefillObject)) {
      if (isPrefillable(prefillObject, key)) {
        (fixture.value as Record<string, unknown>)[key] = value;
      }
    }
  }
  catch {
    // A malformed prefill query is ignored; the editor keeps the empty fixture.
  }
}

/**
 * Applies the author and GitHub username remembered from earlier sessions.
 */
function applyStoredPrefillData() {
  if (!import.meta.client) {
    return;
  }

  if (fixture.value.metaAuthor === '') {
    fixture.value.metaAuthor = getStoredItem('prefillAuthor') || '';
  }

  if (githubUsername.value === '') {
    githubUsername.value = getStoredItem('prefillGithubUsername') || '';
  }
}

/**
 * Remembers the author and GitHub username for later sessions.
 */
function storePrefillData() {
  if (!import.meta.client) {
    return;
  }
  setStoredItem('prefillAuthor', fixture.value.metaAuthor);
  setStoredItem('prefillGithubUsername', githubUsername.value);
}

/**
 * Validates the editor form and starts the submit flow.
 */
async function onSubmit() {
  const { valid } = await editorForm.submit();
  if (!valid) {
    scrollToFirstInvalidField();
    return;
  }

  if (honeypot.value !== '') {
    alert('Do not fill the "Ignore" fields!');
    return;
  }

  submitDialog.value?.validate([fixture.value]);
}

/**
 * Clears auto-save state after a successful submission.
 */
function onFixtureSubmitted() {
  storePrefillData();
  clearAutoSave();
}

/**
 * Resets the editor to an empty fixture.
 */
async function reset() {
  fixture.value = getEmptyFixture();
  channel.value = getEmptyChannel();
  honeypot.value = '';
  applyStoredPrefillData();

  router.push({
    path: route.path,
    query: {},
  });

  await nextTick();

  editorForm.reset();
  window.scrollTo(0, 0);
}

watch(fixture, () => {
  autoSave();
}, { deep: true });

onMounted(() => {
  applyQueryPrefillData();
  applyStoredPrefillData();

  nextTick(() => {
    restoreAutoSave();
  });
});

useHead({
  title: 'Fixture Editor',
});

/**
 * Checks whether a query prefill value has the expected type.
 * @param prefillObject - The parsed prefill object.
 * @param key - The fixture field key.
 * @returns Whether the value can be applied.
 */
function isPrefillable(prefillObject: Record<string, unknown>, key: string): boolean {
  const allowedPrefillValues: Record<string, string> = {
    useExistingManufacturer: 'boolean',
    manufacturerKey: 'string',
    newManufacturerRdmId: 'number',
    rdmModelId: 'number',
  };

  return key in allowedPrefillValues && typeof prefillObject[key] === allowedPrefillValues[key];
}
</script>
