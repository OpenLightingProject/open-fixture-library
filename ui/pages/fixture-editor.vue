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

      <Form
        ref="formRef"
        :state="formstate"
        action="#"
        class="only-js"
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

        <section class="fixture-modes">
          <EditorMode
            v-for="(mode, index) in fixture.modes"
            :key="mode.uuid"
            :mode="fixture.modes[index]"
            :index="index"
            :fixture="fixture"
            :formstate="formstate"
            @open-channel-editor="openChannelEditor($event)"
            @remove="fixture.modes.splice(index, 1)" />

          <a class="fixture-mode card add-mode-link" href="#add-mode" @click.prevent="addNewMode()">
            <h2>+ Add mode</h2>
          </a>

          <div class="clearfix" />
        </section>

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

      </Form>

      <EditorChannelDialog
        :channel="channel"
        :fixture="fixture"
        @reset-channel="resetChannel()"
        @channel-changed="autoSave('channel')"
        @remove-channel="removeChannel($event)" />

      <EditorChooseChannelEditModeDialog
        :channel="channel"
        :fixture="fixture" />

      <EditorRestoreDialog v-model="restoredData" @restore-complete="restoreComplete()" />

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
import scrollIntoView from 'scroll-into-view';

import { schemaDefinitions } from '~~/lib/schema-properties.js';
import {
  constants,
  getEmptyChannel,
  getEmptyFixture,
  getEmptyFormState,
  getEmptyMode,
} from '@/assets/scripts/editor-utilities.js';

const route = useRoute();
const router = useRouter();

const { data: manufacturers } = await useFetch('/api/v1/manufacturers');

const formstate = ref(getEmptyFormState());
const readyToAutoSave = ref(false);
const restoredData = ref<unknown>(undefined);
const fixture = ref(getEmptyFixture());
const channel = ref(getEmptyChannel());
const githubUsername = ref('');
const honeypot = ref('');
const submitDialog = ref<{ validate: (data: unknown[]) => void } | null>(null);

function addNewMode() {
  fixture.value.modes.push(getEmptyMode());
}

function openChannelEditor(channelData: Record<string, unknown>) {
  channel.value = { ...channel.value, ...channelData };
}

function resetChannel() {
  channel.value = getEmptyChannel();
}

function getChannelName(channelUuid: string): string {
  const channel = fixture.value.availableChannels[channelUuid];

  if ('coarseChannelId' in channel) {
    let name = `${getChannelName(channel.coarseChannelId)} fine`;
    if (channel.resolution > constants.RESOLUTION_16BIT) {
      name += `^${channel.resolution - 1}`;
    }

    return name;
  }

  return channel.name;
}

function isChannelNameUnique(channelUuid: string): boolean {
  const channelName = getChannelName(channelUuid);

  return Object.keys(fixture.value.availableChannels).every(
    uuid => channelName !== getChannelName(uuid) || uuid === channelUuid,
  );
}

function removeChannel(channelUuid: string, modeUuid?: string) {
  if (modeUuid) {
    const channelMode = fixture.value.modes.find(mode => mode.uuid === modeUuid);

    if (channelMode) {
      const channelPosition = channelMode.channels.indexOf(channelUuid);
      if (channelPosition !== -1) {
        channelMode.channels.splice(channelPosition, 1);
      }
    }

    return;
  }

  // remove fine channels first
  for (const channel of Object.values(fixture.value.availableChannels)) {
    if ('coarseChannelId' in channel && channel.coarseChannelId === channelUuid) {
      removeChannel(channel.uuid);
    }
  }

  // now remove all references from modes
  for (const mode of fixture.value.modes) {
    removeChannel(channelUuid, mode.uuid);
  }

  // finally remove the channel itself
  delete fixture.value.availableChannels[channelUuid];
}

function autoSave(objectName: 'fixture' | 'channel') {
  if (!readyToAutoSave.value) {
    return;
  }

  if (objectName === 'fixture') {
    console.log('autoSave fixture:', JSON.parse(JSON.stringify(fixture.value, null, 2)));
  }
  else if (objectName === 'channel') {
    console.log('autoSave channel:', JSON.parse(JSON.stringify(channel.value, null, 2)));
  }

  localStorage.setItem('autoSave', JSON.stringify([
    {
      fixture: fixture.value,
      channel: channel.value,
      timestamp: Date.now(),
    },
  ]));
}

function clearAutoSave() {
  localStorage.removeItem('autoSave');
}

function restoreAutoSave() {
  try {
    const saved = JSON.parse(localStorage.getItem('autoSave') || 'null');
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
    return;
  }

  console.log('restore', structuredClone(restoredData.value));
}

function restoreComplete() {
  readyToAutoSave.value = true;
  window.scrollTo(0, 0);
}

function applyQueryPrefillData() {
  if (!route.query.prefill) {
    return;
  }

  try {
    const prefillObject = JSON.parse(route.query.prefill as string);
    for (const key of Object.keys(prefillObject)) {
      if (isPrefillable(prefillObject, key)) {
        (fixture.value as Record<string, unknown>)[key] = prefillObject[key];
      }
    }
  }
  catch (parseError) {
    console.log('prefill query could not be parsed:', route.query.prefill, parseError);
  }
}

function applyStoredPrefillData() {
  if (!import.meta.client) {
    return;
  }

  if (fixture.value.metaAuthor === '') {
    fixture.value.metaAuthor = localStorage.getItem('prefillAuthor') || '';
  }

  if (githubUsername.value === '') {
    githubUsername.value = localStorage.getItem('prefillGithubUsername') || '';
  }
}

function storePrefillData() {
  if (!import.meta.client) {
    return;
  }
  localStorage.setItem('prefillAuthor', fixture.value.metaAuthor);
  localStorage.setItem('prefillGithubUsername', githubUsername.value);
}

function onSubmit() {
  if (formstate.value.$invalid) {
    const field = document.querySelector('.vf-field-invalid');

    if (field) {
      scrollIntoView(field, {
        time: 300,
        align: {
          top: 0,
          left: 0,
          topOffset: 100,
        },
        isScrollable: target => target === window,
      }, () => (field as HTMLElement).focus());
    }

    return;
  }

  if (honeypot.value !== '') {
    alert('Do not fill the "Ignore" fields!');
    return;
  }

  submitDialog.value?.validate([fixture.value]);
}

function onFixtureSubmitted() {
  storePrefillData();
  clearAutoSave();
}

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

  formstate.value._reset();
  window.scrollTo(0, 0);
}

watch(fixture, () => {
  autoSave('fixture');
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
